# Architecture Overview

Prisan Beauty is a Next.js 15 application using the App Router with a hybrid SSR/CSR model. Below is a deep dive into the architecture decisions, data flow, and key patterns.

## Rendering Model

| Page Type | Rendering | Rationale |
|-----------|-----------|-----------|
| Home, Services, Blog, Gallery, FAQ | Server components + `force-dynamic` | SEO-critical, fresh data on every request |
| Booking (multi-step form) | Client component (`"use client"`) | Interactive state machine |
| Admin pages | Mix of server and client | Server for data fetching, client for form/modals |
| Admin Dashboard | Server component | Display-only stats, always fresh |

## Data Flow

```
Browser  ←→  Next.js Server  ←→  Prisma Client  ←→  PostgreSQL
                │
                ├── Server Actions (mutations)
                ├── API Route (/api/upload)
                └── Middleware (auth guard)
```

- **Reads:** Server components fetch data directly via `lib/actions.ts` server actions → Prisma → PostgreSQL
- **Mutations:** Client components invoke server actions (`"use server"`) for all CRUD operations
- **Revalidation:** After mutations, `revalidatePath()` triggers fresh server component renders
- **File Upload:** Client POSTs to `/api/upload` → Sharp processes image → writes to `UPLOAD_DIR`

## Authentication Architecture

```
Login Form → loginAction() → bcrypt verify → JWT sign (HS256) → httpOnly cookie

Middleware → checks cookie on /admin/* → redirects to /admin/login if missing

Server Actions → requireAdmin() → verifies JWT + checks admin role → throws if unauthorized
```

- JWTs are signed with `jose` (not `jsonwebtoken`) for Edge compatibility
- Sessions expire after 24 hours
- No refresh token flow; admin re-logs in after expiry
- The `User` model supports future role-based expansion (currently all admins share role `"admin"`)

## Booking Flow

```
1. Select Services (multi-select, category filter)
2. Choose Stylist (radio-style cards)
3. Pick Date & Time (date input + 30-min slots 09:00–18:30)
4. Enter Info (name, email, phone, optional notes)
5. Confirm (review summary)

Submit → createBooking() server action:
  ├─ Prisma transaction (booking + booking_items)
  ├─ sendBookingConfirmation(customer)
  └─ sendAdminNotification(admin)

Redirect → /booking/confirmation/[id]
```

- `date-fns` handles date formatting
- `generateTimeSlots()` produces 30-min intervals from 09:00 to 18:30
- Email failures are logged but do not block booking creation

## Standalone Deployment Architecture

Next.js `output: "standalone"` produces a self-contained runtime in `.next/standalone/`:

```
.next/standalone/
├── server.js              # Custom Next.js server
├── .next/
│   └── static/            # JS/CSS chunks
├── public/                # Static assets
│   └── uploads/           # Persistent user uploads (symlinked)
├── node_modules/
│   ├── .prisma/           # Prisma query engine
│   └── sharp/             # Native image addon
└── .env                   # Runtime environment
```

**Key decisions:**
- `post-build.sh` copies Prisma engines and Sharp into standalone — these are required at runtime and not included by default
- Uploads directory is symlinked (not copied) to preserve files across deploys
- PM2 manages the process with a 1GB memory limit and autorestart

## Component Architecture

### UI Components (`src/components/ui/`)
All headless, reusable primitives:
- **Button** — Variant-based (primary, outline, ghost, danger)
- **Card** + **CardContent** — Layout containers
- **Input** — Controlled wrapper with label
- **Select** — Dropdown wrapper with options
- **Textarea** — Multi-line input
- **Modal** — Overlay dialog with backdrop
- **Badge** — Status/label pills
- **Spinner** — Loading indicator

### Layout Components (`src/components/layout/`)
- **Navbar** — Responsive nav with mobile hamburger menu; links: Home, Services, Gallery, Blog, FAQ, Booking
- **Footer** — Site footer with branding
- **AdminNav** — Sidebar nav for admin panel (Dashboard, Bookings, Services, Stylists, Gallery, Blog, FAQs, SEO)

## Database Design

### Key Relationships

```
Booking 1──N BookingItem N──1 Service
Booking N──1 Stylist
```

### Schema Conventions
- All tables use `@@map("snake_case")` for raw SQL compatibility
- All timestamps use `@map("created_at")` / `@map("updated_at")`
- Soft-delete is not used; records are hard-deleted
- `active` boolean toggles visibility on Services, Stylists, and FAQs

## Email System

Three email templates via Nodemailer + SMTP:
1. **Booking Confirmation** — Sent to customer on booking; includes service, stylist, date/time, price, confirmation code
2. **Admin Notification** — Sent to `ADMIN_EMAIL`; includes customer contact info, booking details, direct link to admin
3. **Status Update** — Sent to customer when admin changes booking status; includes updated status label

Emails use inline HTML styling (no template engine) and are sent synchronously within server actions.

## Image Upload Pipeline

```
Client upload → /api/upload
  ├── Validate MIME (jpeg, png, webp, avif)
  ├── Decode with Sharp
  ├── Resize to max 1200px width (without enlargement)
  ├── Convert to JPEG @ 70% quality
  └── Write to {UPLOAD_DIR}/uploads/services/{timestamp}-{random}.jpg
```

- `UPLOAD_DIR` defaults to `./public`; in production set to a persistent path outside the build tree
- Files are served as static assets via the `/uploads/` URL path
- Only service images use this pipeline; gallery images are added via URL

## SEO Architecture

- **Per-page meta tags** via Next.js `Metadata` export in server components
- **Injector** — `<SeoMetaInjector>` reads from the database and injects `<title>`, `<meta>`, `<script type="application/ld+json">` dynamically
- **Admin SEO editor** — CRUD for the `seo_meta` table keyed by page slug
- **JSON-LD** — FAQ page generates `FAQPage` schema; blog generates `Article`/`Blog` schema; custom schema supported via the SEO editor

## Middleware Protection

The `middleware.ts` runs on `matcher: ["/admin/:path*"]` and checks for the `session` cookie. It does **not** verify the JWT itself — that is deferred to `requireAdmin()` within each server action. This keeps the middleware lightweight and avoids database calls on every navigation.

Protected paths (checked by middleware):
- `/admin`, `/admin/bookings`, `/admin/services`, `/admin/stylists`

Other admin paths (`/admin/gallery`, `/admin/blog`, `/admin/faqs`, `/admin/seo`) are **not** checked by middleware but are protected by `requireAdmin()` in their server actions.
