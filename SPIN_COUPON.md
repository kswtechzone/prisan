# Spin & Coupon System

## Architecture Overview

```
Admin creates offers     Admin creates coupons      Admin configures
     │                        │                    spin settings
     ▼                        ▼                        ▼
 SpinOffer ──┐          CouponCode                    SpinConfig
              │               │
              │    ┌──────────┘
              ▼    ▼
User spins ─► spinAction()
                │
                ├── Daily limit check (DailySpinUsage)
                ├── Anti-spam cooldown (3s)
                ├── Weighted random selection from SpinOffer[]
                ├── Weekly claim cooldown (1 per N days)
                │
                ▼
           SpinHistory (pending if won, active if not)
                │
                ├── User confirms → confirmSpin()
                │   └── Creates CouponCode (type: spin) + UserCoupon
                ├── User skips    → skipSpin()
                └── User books    → validateCoupon() + calculateInvoice()
```

## Database Schema

### SpinOffer
Stores the rewards that appear on the wheel and are selectable via weighted RNG.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `title` | String | Display name on the wheel segment |
| `description` | String? | Optional description |
| `probability` | Float (0-100) | Weight used in random selection |
| `rewardType` | String | `"coupon"` / `"none"` |
| `couponCode` | String? | Optional fixed coupon code |
| `image` | String? | Optional image URL |
| `isActive` | Boolean | Whether the offer appears on the wheel |
| `color` | String | Hex color for the wheel segment |
| `category` | String? | Service category restriction |
| `discountPercent` | Float? | Discount percent if won |
| `discountValue` | Float? | Fixed discount amount if won |
| `discountType` | String? | `"percentage"` / `"fixed"` / `"full_service"` |
| `expiryDate` | DateTime? | Expiry for the reward |

### SpinHistory
Records each spin a user performs.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK to User |
| `offerId` | String? | FK to SpinOffer |
| `reward` | String | Reward label (e.g. "10% Off") |
| `couponCode` | String? | Generated coupon code if won |
| `status` | Enum | `"pending"` / `"active"` / `"redeemed"` / `"expired"` / `"skipped"` |
| `expiryDate` | DateTime? | Coupon expiry |
| `discountPercent` | Float? | Copied from SpinOffer at spin time |
| `discountValue` | Float? | Copied from SpinOffer at spin time |
| `discountType` | String? | Copied from SpinOffer at spin time |
| `category` | String? | Copied from SpinOffer at spin time |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

Relations: `belongs to User`, `belongs to SpinOffer`

### DailySpinUsage
Tracks how many spins a user has used on a given calendar day.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK to User |
| `date` | DateTime (db.Date) | Calendar date (UTC) |
| `spinsUsed` | Int | Count of spins performed |

Unique constraint: `[userId, date]`

### SpinConfig
Singleton configuration for the spin game.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String | `"global"` | Singleton key |
| `dailySpinLimit` | Int | `10` | Max spins per user per day |
| `weeklyClaimPeriodDays` | Int | `7` | Cooldown between claims |
| `antiSpamCooldownMs` | Int | `3000` | Min ms between consecutive spins |
| `stalePendingMinutes` | Int | `10` | Time before pending spins auto-expire |

### CouponCode
Template/definition for all coupon types.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `code` | String (unique) | The coupon code the user enters |
| `title` | String | Display name |
| `description` | String? | Description/terms |
| `couponType` | String | `"public"` / `"private"` / `"spin"` / `"referral"` |
| `discountType` | String | `"percentage"` / `"fixed"` / `"full_service"` |
| `discountValue` | Float? | Fixed amount off |
| `discountPercent` | Float? | Percentage off |
| `category` | String? | Service category restriction |
| `allowedServices` | String[] | Specific service ID restrictions |
| `isPublic` | Boolean | Visible to all users |
| `isActive` | Boolean | Can be used |
| `minimumAmount` | Float? | Minimum booking total required |
| `maxUsage` | Int? | Max times this code can be used (0 = unlimited) |
| `usedCount` | Int | Current usage count |
| `expiryDate` | DateTime? | When the coupon expires |
| `createdAt` | DateTime | Auto |

### UserCoupon
Assignment of a CouponCode to a specific user.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK to User |
| `couponId` | String | FK to CouponCode |
| `code` | String (unique) | The actual code the user enters |
| `isRedeemed` | Boolean | Whether it's been used |
| `redeemedAt` | DateTime? | When it was used |
| `assignedAt` | DateTime | When the user got it |

### CouponUsage
Audit log of every coupon redemption.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `couponId` | String | FK to CouponCode |
| `userId` | String | FK to User |
| `bookingId` | String | FK to Booking |
| `discountAmount` | Float | Actual discount applied |
| `createdAt` | DateTime | Auto |

---

## Spin Logic (`src/lib/spin.ts`)

### `spin()` — Main Entr-y Point

```
1. Authenticate → require userId from session
2. Read SpinConfig from DB (cached via upsert with defaults)
3. Daily limit check:
   - Query DailySpinUsage for today(userId, date)
   - If spinsUsed >= dailySpinLimit → throw "Daily spin limit reached"
4. Anti-spam cooldown:
   - Query most recent SpinHistory for user
   - If elapsed < antiSpamCooldownMs → throw "Please wait before spinning again"
5. Weighted random offer selection:
   - Fetch all active SpinOffers ordered by probability desc
   - Calculate total probability sum
   - Generate random float [0, total)
   - Walk through offers accumulating until random < accumulated
   - If no offer matches → return "Better Luck Next Time" (still uses a spin)
6. Weekly claim cooldown (only if an offer was selected):
   - Find the start of the current claim period (now minus weeklyClaimPeriodDays)
   - Count SpinHistory records in [periodStart, now] where status != "skipped" and an offer was won
   - If count >= 1 → return "Better Luck Next Time" with nextEligibleDate
7. Generate coupon code suffix (6-char alphanumeric from crypto.randomBytes)
8. Create SpinHistory record:
   - If a coupon was won: status = "pending" (needs user confirmation)
   - If no coupon: status = "active" (immediately active)
9. Return SpinResult to the client
```

### `confirmSpin(spinHistoryId)`

```
1. Look up the SpinHistory record (must be "pending" status, owned by current user)
2. Generate a unique coupon code: "SPIN-{6-char-suffix}"
3. Create a CouponCode record:
   - couponType = "spin"
   - discount fields copied from the SpinOffer
   - code = "SPIN-{suffix}"
4. Create a UserCoupon record linking user + coupon
5. Update SpinHistory: status → "active", couponCode set
6. Upsert DailySpinUsage for today (increment spinsUsed by 1)
7. Return the result
```

### `skipSpin(spinHistoryId)`

```
1. Look up the SpinHistory record (must be "pending" status, owned by current user)
2. Update status → "skipped"
3. Upsert DailySpinUsage for today (increment spinsUsed by 1)
```

### `getRemainingSpins()`

```
1. Read SpinConfig for dailySpinLimit
2. If not authenticated → return { used: 0, max, remaining: max, nextReset: "" }
3. Query DailySpinUsage for today
4. Return { used, max, remaining: max - used, nextReset: tomorrow ISO string }
```

### `getWeeklyCouponStatus()`

```
1. If not authenticated → return { claimed: false, nextEligibleDate: null }
2. Look for an unredeemed UserCoupon with couponType "spin" for this user
3. If found → return { claimed: true, nextEligibleDate: null }
4. If not found → return { claimed: false, nextEligibleDate: null }
```

### `getUserRewards(userId)`

Returns all UserCoupon records where:
- The user owns the coupon
- The linked CouponCode has couponType "spin"
- Ordered by assignedAt desc

---

## Spin Action (`src/lib/actions.ts`)

### `spinAction()`

Server action wrapper around `spin()`:

```
1. Call auth() to get session
2. If no session → return error SpinResult { error: true, message: "Please log in to spin" }
3. Call spin() from spin.ts
4. If error → return error SpinResult
5. Return the SpinResult from spin()
```

### `confirmSpin(spinHistoryId)` / `skipSpin(spinHistoryId)`

Simple wrappers that delegate to `spin.ts`.

---

## Coupon Validation (`src/lib/actions.ts:validateCoupon`)

Three validation paths, tried in order:

### Path 1: UserCoupon (private/spin coupons)

```
1. Query CouponCode where code matches AND (isPublic OR user has UserCoupon for it)
2. If not found → fall through to Path 2
3. Validate:
   a. isActive must be true
   b. expiryDate must be null or in the future
   c. If maxUsage > 0 → usedCount < maxUsage
   d. If coupon has category → booking must include a service in that category
   e. If coupon has allowedServices → booking must include at least one allowed service
   f. If minimumAmount > 0 → booking subtotal must be >= minimumAmount
   g. If couponType is "spin" → check UserCoupon.isRedeemed is false
4. Return validation result with all discount fields
```

### Path 2: CouponCode (public/general coupons)

```
1. Query CouponCode where code matches AND isPublic = true
2. If not found → fall through to Path 3
3. Same validation as Path 1 (a through f)
4. Return validation result
```

### Path 3: Legacy SpinHistory

```
1. Query SpinHistory where couponCode matches AND status = "active"
2. If not found → return invalid
3. Return validation result with discount fields from SpinHistory
```

---

## Billing Integration (`src/lib/billing.ts:calculateInvoice`)

When a booking is created, `calculateInvoice` computes the final total with coupon discount:

```
Input: lineItems[], couponInfo?
Output: { items[], subtotal, discount, total, appliedCoupon? }

If couponInfo is provided:
  1. Determine discount type:
     - percentage: discount = subtotal × (discountPercent / 100)
     - fixed: discount = discountValue (split proportionally across items)
     - full_service: discount = sum of all service item prices (i.e. free)
  2. If fixed discount with multiple items:
     - Distribute proportionally: itemDiscount = itemPrice × (discountValue / subtotal)
  3. If category/restricted:
     - Only apply discount to items in the allowed category/services
  4. Cap: total cannot go below 0
  5. Return applied discount amount for CouponUsage audit
```

In `createBooking`:

```
1. Validate coupon (if code provided) → returns CouponValidationResult
2. Calculate invoice with coupon discount
3. Prisma transaction:
   a. Create Booking + BookingItems
   b. If coupon was used:
      - Mark coupon as redeemed (UserCoupon.isRedeemed = true / SpinHistory.status = "redeemed")
      - Increment CouponCode.usedCount
      - Create CouponUsage record with actual discountAmount
4. Send confirmation emails
```

---

## Coupon Lifecycle

```
                         ┌──────────────┐
                         │  CouponCode   │  ← Template (created by admin or spin system)
                         │  (template)   │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │  UserCoupon   │  │  Public use  │  │ Legacy       │
      │  (spin/priv)  │  │  (any user)  │  │ SpinHistory  │
      └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
             │                 │                  │
             └────────┬────────┘──────────────────┘
                      │
                      ▼
             validateCoupon()
                      │
                      ▼
             createBooking()
                      │
                      ▼
               CouponUsage        ← Audit record
               isRedeemed = true  ← Marked on coupon
               usedCount++        ← Incremented on template
```

### Coupon Types (`CouponCode.couponType`)

| Type | Source | Assigned To | Public? |
|------|--------|-------------|---------|
| `spin` | Spin game win | Specific user via UserCoupon | No |
| `public` | Admin created (general coupons) | Anyone who enters the code | Yes |
| `private` | Admin created | Specific user via UserCoupon | No |
| `referral` | Admin created | Via referral link | Yes |

### Discount Types (`discountType`)

| Type | Effect | Example |
|------|--------|---------|
| `percentage` | `subtotal × (discountPercent / 100)` | 10% off |
| `fixed` | `discountValue` subtracted | NPR 500 off |
| `full_service` | Entire service total free | Free service |

---

## Spin States

```
                    spin()
                       │
                       ▼
                 ┌───────────┐
                 │  pending  │ ←── Only when a coupon is won (needs confirmation)
                 └─────┬─────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        ┌─────────┐      ┌─────────┐
        │ active  │      │ skipped │
        └────┬────┘      └─────────┘
             │
             ▼
        ┌───────────┐
        │ redeemed  │ ←── After booking with coupon
        └───────────┘

        If not won: status = "active" immediately
        (skips the "pending" state)
```

---

## Admin Management Pages

### `/admin/spin-settings`
- `dailySpinLimit` — max spins per user per day (default 10)
- `weeklyClaimPeriodDays` — cooldown between coupon claims (default 7)
- `antiSpamCooldownMs` — ms between consecutive spins (default 3000)
- `stalePendingMinutes` — auto-expiry for pending spins (default 10)

### `/admin/offers`
- CRUD for SpinOffer records
- Fields: title, description, probability, rewardType, couponCode, color, category, discountPercent, discountValue, discountType, expiryDate
- Toggle active/inactive
- Ordered by probability (highest first)

### `/admin/coupons`
- Read-only view of all user-assigned coupon codes
- Shows: customer name/email, coupon code, reward, discount, category, status (active/redeemed/pending), source (spin/admin), date
- Sources: "Spin" (from spin game), "Admin" (manually assigned)

### `/admin/general-coupons`
- CRUD for public CouponCode records
- Fields: code (auto or manual), description, discountPercent, discountType, couponType (general/referral), category, maxUsage, expiryDate
- Toggle active/inactive
- Copy code to clipboard
- Shows usage count

### Spin Analytics (`/admin` Dashboard)
- Total spins all-time
- Unique users who have spun
- Total redemptions
- Reward distribution pie chart (count per offer title)
- Daily spin usage (last 7 days)
- Most active users (name, email, spin count)

---

## User Flow End-to-End

```
1. User lands on home page → sees "Spin & Win" CTA with demo wheel
2. Clicks "Play Now" → navigates to /spin
3. Clicks "Spin to Win" button:
   a. Client calls spinAction() server action
   b. Server checks: auth, daily limit, cooldown, RNG selection
   c. Returns SpinResult
4. If not authenticated → shows "Create Account & Play" button → /register
5. If daily limit reached → button disabled "Limit Reached"
6. If spin succeeds → wheel animates (orbital ball + deceleration)
7. Result modal appears:
   a. If won a coupon → pending confirmation modal (Claim / Skip)
      - Claim → confirmSpin() → creates CouponCode + UserCoupon → shows "Congratulations!" with code
      - Skip → skipSpin() → marks as skipped → closes modal
   b. If "Better Luck Next Time" → shows message
   c. If error → shows error message
8. Claimed coupon → user can use code at booking:
   a. Enters coupon code in booking form
   b. Server validates via validateCoupon()
   c. Calculates discount via calculateInvoice()
   d. On booking confirmation, marks coupon as redeemed
```
