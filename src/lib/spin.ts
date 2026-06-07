import { prisma } from "./prisma"
import { auth } from "./auth"
import { randomBytes } from "crypto"

interface SpinResult {
  offerId: string | null
  reward: string
  couponCode: string | null
  color: string
  needsConfirmation?: boolean
  spinHistoryId?: string
  nextEligibleDate?: string
}

interface SpinConfig {
  dailySpinLimit: number
  weeklyClaimPeriodDays: number
  antiSpamCooldownMs: number
  stalePendingMinutes: number
}

async function getSpinConfig(): Promise<SpinConfig> {
  const config = await prisma.spinConfig.findFirst()
  return {
    dailySpinLimit: config?.dailySpinLimit ?? 10,
    weeklyClaimPeriodDays: config?.weeklyClaimPeriodDays ?? 7,
    antiSpamCooldownMs: config?.antiSpamCooldownMs ?? 3000,
    stalePendingMinutes: config?.stalePendingMinutes ?? 10,
  }
}

function generateCouponSuffix(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  const bytes = randomBytes(6)
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

function todayDate(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function weeklyMs(days: number): number {
  return days * 24 * 60 * 60 * 1000
}

export async function spin(): Promise<SpinResult> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Please log in to spin")
  }

  const cfg = await getSpinConfig()
  const userId = session.user.id

  // ── Daily spin limit ──
  const today = todayDate()
  const usage = await prisma.dailySpinUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today, spinsUsed: 0 },
  })

  if (usage.spinsUsed >= cfg.dailySpinLimit) {
    throw new Error("Daily spin limit reached. Come back tomorrow!")
  }

  // ── Anti-spam cooldown ──
  const recentSpin = await prisma.spinHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  if (recentSpin) {
    const elapsed = Date.now() - recentSpin.createdAt.getTime()
    if (elapsed < cfg.antiSpamCooldownMs) {
      throw new Error("Please wait before spinning again")
    }
  }

  // ── Weighted random ──
  const offers = await prisma.spinOffer.findMany({
    where: { isActive: true },
  })

  if (offers.length === 0) {
    return { offerId: null, reward: "Better Luck Next Time", couponCode: null, color: "#E5E7EB" }
  }

  const totalProbability = offers.reduce((sum, o) => sum + o.probability, 0)
  let random = Math.random() * totalProbability

  for (const offer of offers) {
    random -= offer.probability
    if (random <= 0) {
      let couponCode: string | null = null
      if (offer.rewardType !== "none") {
        const suffix = generateCouponSuffix()
        couponCode = offer.couponCode
          ? `${offer.couponCode}-${suffix}`
          : suffix
      }

      // ── Weekly coupon check ──
      if (couponCode) {
        // Clean up stale pending records so they don't orphan
        await prisma.spinHistory.updateMany({
          where: {
            userId,
            status: "pending",
            createdAt: { lt: new Date(Date.now() - cfg.stalePendingMinutes * 60 * 1000) },
          },
          data: { status: "skipped" },
        })

        const weeklyClaim = await prisma.spinHistory.findFirst({
          where: {
            userId,
            couponCode: { not: null },
            status: { in: ["active", "redeemed"] },
            createdAt: { gte: new Date(Date.now() - weeklyMs(cfg.weeklyClaimPeriodDays)) },
          },
        })

        if (weeklyClaim) {
          const nextEligible = new Date(weeklyClaim.createdAt.getTime() + weeklyMs(cfg.weeklyClaimPeriodDays))
          await prisma.spinHistory.create({
            data: {
              userId,
              offerId: offer.id,
              reward: "Better Luck Next Time",
              couponCode: null,
              status: "skipped",
            },
          })
          await prisma.dailySpinUsage.update({
            where: { userId_date: { userId, date: today } },
            data: { spinsUsed: { increment: 1 } },
          })
          return { offerId: null, reward: "Better Luck Next Time", couponCode: null, color: "#E5E7EB", nextEligibleDate: nextEligible.toISOString() }
        }

        // First coupon this period — save as pending
        const record = await prisma.spinHistory.create({
          data: {
            userId,
            offerId: offer.id,
            reward: offer.title,
            couponCode,
            status: "pending",
            discountPercent: offer.discountPercent ?? 0,
            discountValue: offer.discountValue ?? offer.discountPercent ?? 0,
            discountType: offer.discountType || "percentage",
            category: offer.category || null,
          },
        })

        return {
          offerId: offer.id,
          reward: offer.title,
          couponCode,
          color: offer.color || "#8B5E3C",
          needsConfirmation: true,
          spinHistoryId: record.id,
        }
      }

      // No coupon — save immediately
      await prisma.spinHistory.create({
        data: {
          userId,
          offerId: offer.id,
          reward: offer.title,
          couponCode: null,
          status: "active",
        },
      })
      await prisma.dailySpinUsage.update({
        where: { userId_date: { userId, date: today } },
        data: { spinsUsed: { increment: 1 } },
      })

      return {
        offerId: offer.id,
        reward: offer.title,
        couponCode: null,
        color: offer.color || "#8B5E3C",
      }
    }
  }

  return { offerId: null, reward: "Better Luck Next Time", couponCode: null, color: "#E5E7EB" }
}

export async function confirmSpin(spinHistoryId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  const record = await prisma.spinHistory.findUnique({
    where: { id: spinHistoryId },
    include: { offer: true },
  })
  if (!record || record.userId !== session.user.id) return
  if (record.status !== "pending") return

  const today = todayDate()

  const coupon = await prisma.couponCode.create({
    data: {
      code: record.couponCode || generateCouponSuffix(),
      title: record.reward,
      description: `Spin reward: ${record.reward}`,
      couponType: "spin",
      discountType: record.discountType || "percentage",
      discountValue: record.discountValue ?? record.discountPercent ?? 0,
      discountPercent: record.discountPercent ?? null,
      category: record.category || null,
      allowedServices: [],
      isPublic: false,
      isActive: true,
      maxUsage: 1,
      expiryDate: record.expiryDate || undefined,
    },
  })

  await prisma.userCoupon.create({
    data: {
      userId: session.user.id,
      couponId: coupon.id,
      code: record.couponCode || coupon.code,
    },
  })

  await prisma.spinHistory.update({
    where: { id: spinHistoryId },
    data: { status: "active" },
  })

  await prisma.dailySpinUsage.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    update: { spinsUsed: { increment: 1 } },
    create: { userId: session.user.id, date: today, spinsUsed: 1 },
  })
}

export async function skipSpin(spinHistoryId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  const today = todayDate()

  await prisma.spinHistory.update({
    where: { id: spinHistoryId },
    data: { status: "skipped" },
  })

  await prisma.dailySpinUsage.upsert({
    where: { userId_date: { userId: session.user.id, date: today } },
    update: { spinsUsed: { increment: 1 } },
    create: { userId: session.user.id, date: today, spinsUsed: 1 },
  })
}

export async function getRemainingSpins(): Promise<{
  used: number
  max: number
  remaining: number
  nextReset: string
}> {
  const session = await auth()
  const cfg = await getSpinConfig()

  if (!session?.user?.id) {
    return { used: 0, max: cfg.dailySpinLimit, remaining: cfg.dailySpinLimit, nextReset: "" }
  }

  const today = todayDate()
  const usage = await prisma.dailySpinUsage.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
  })

  const used = usage?.spinsUsed ?? 0
  const remaining = Math.max(0, cfg.dailySpinLimit - used)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextReset = tomorrow.toISOString()

  return { used, max: cfg.dailySpinLimit, remaining, nextReset }
}

export async function getWeeklyCouponStatus(): Promise<{
  claimed: boolean
  nextEligibleDate: string | null
}> {
  const session = await auth()
  const cfg = await getSpinConfig()

  if (!session?.user?.id) {
    return { claimed: false, nextEligibleDate: null }
  }

  const claim = await prisma.userCoupon.findFirst({
    where: {
      userId: session.user.id,
      isRedeemed: false,
      coupon: { couponType: "spin" },
    },
    include: { coupon: true },
    orderBy: { assignedAt: "desc" },
  })

  if (!claim) {
    return { claimed: false, nextEligibleDate: null }
  }

  const nextEligible = new Date(claim.assignedAt.getTime() + weeklyMs(cfg.weeklyClaimPeriodDays))
  return { claimed: true, nextEligibleDate: nextEligible.toISOString() }
}

export async function getSpinHistory(userId?: string) {
  const where = userId ? { userId } : undefined
  return prisma.spinHistory.findMany({
    where,
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getUserRewards(userId: string) {
  return prisma.userCoupon.findMany({
    where: {
      userId,
      coupon: { couponType: "spin" },
    },
    include: { coupon: true },
    orderBy: { assignedAt: "desc" },
  })
}

export async function getActiveOffers() {
  return prisma.spinOffer.findMany({
    where: { isActive: true },
    orderBy: { probability: "desc" },
  })
}
