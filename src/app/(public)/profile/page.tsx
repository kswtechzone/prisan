import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Gift,
  Ticket,
  History,
  LogOut,
  Timer,
  AlertTriangle,
  Calendar,
} from "lucide-react"
import Link from "next/link"

async function handleLogout() {
  "use server"
  const { signOut } = await import("@/lib/auth")
  await signOut({ redirectTo: "/" })
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalSpins,
    spinHistory,
    userCoupons,
    user,
    dailyUsage,
  ] = await Promise.all([
    prisma.spinHistory.count({ where: { userId } }),
    prisma.spinHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.userCoupon.findMany({
      where: { userId },
      include: { coupon: true },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true, mobile: true, address: true, totalTimeSpent: true },
    }),
    prisma.dailySpinUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
  ])

  const spinsToday = dailyUsage?.spinsUsed ?? 0
  const maxDaily = 10
  const remainingToday = Math.max(0, maxDaily - spinsToday)

  const activeCoupons = userCoupons.filter((uc) => !uc.isRedeemed && uc.coupon.isActive)
  const redeemedCoupons = userCoupons.filter((uc) => uc.isRedeemed)

  const stats = [
    { icon: Sparkles, label: "Spins", value: totalSpins, color: "text-blue-600 bg-blue-50" },
    { icon: Gift, label: "Rewards Won", value: userCoupons.length, color: "text-green-600 bg-green-50" },
    { icon: Ticket, label: "Active Coupons", value: activeCoupons.length, color: "text-purple-600 bg-purple-50" },
    { icon: Timer, label: "Time on Platform", value: formatDuration(user?.totalTimeSpent ?? 0), color: "text-amber-600 bg-amber-50", isString: true } as const,
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-luxury-gold/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-luxury-gold" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
                    {user?.fullName || session.user.name}
                  </h1>
                  <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {session.user.email}
                    </span>
                    {user?.mobile && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {user.mobile}
                      </span>
                    )}
                    {user?.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {user.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <form action={handleLogout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Sign Out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* My Bookings - mobile first, right after profile */}
        <div className="order-2 md:order-none">
          <Link href="/profile/bookings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-luxury-gold/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="font-semibold text-luxury-charcoal">My Bookings</p>
                    <p className="text-xs text-gray-500">View your service and event bookings</p>
                  </div>
                </div>
                <span className="text-luxury-gold text-lg">&rarr;</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Daily remaining spins bar */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-luxury-charcoal">
                Spins Today
              </span>
              <span className="text-sm text-gray-500">
                {remainingToday > 0
                  ? `${remainingToday} of ${maxDaily} remaining`
                  : "Limit reached"}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  spinsToday >= maxDaily ? "bg-red-400" : "bg-luxury-gold"
                }`}
                style={{ width: `${(spinsToday / maxDaily) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-luxury-gold font-medium">
                {spinsToday}/{maxDaily} used
              </span>
              {remainingToday > 0 ? (
                <Link href="/spin" className="text-xs text-luxury-gold hover:underline font-medium">
                  Spin now &rarr;
                </Link>
              ) : (
                <span className="text-xs text-red-400">Resets at midnight</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly coupon status */}
        {activeCoupons.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              You have {activeCoupons.length} active coupon{activeCoupons.length > 1 ? "s" : ""}.{" "}
              <Link href="/booking" className="text-luxury-gold font-medium hover:underline">
                Book now to use
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl px-5 py-3 flex items-center gap-3">
            <Gift className="w-4 h-4 text-luxury-gold shrink-0" />
            <p className="text-sm text-luxury-charcoal">
              No active coupons. <Link href="/spin" className="text-luxury-gold font-medium hover:underline">Spin to win</Link>
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${stat.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Spin & Win CTA */}
        {totalSpins === 0 && (
          <Card className="bg-gradient-to-r from-luxury-gold/5 to-luxury-champagne border-luxury-gold/20">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-10 h-10 text-luxury-gold mx-auto mb-3" />
              <h2 className="text-lg font-display font-semibold mb-2">
                Try Your Luck!
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                You haven&apos;t spun yet! Win discounts, free services, and more.
              </p>
              <Link href="/spin">
                <Button>Spin the Wheel</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Active Coupons (from UserCoupon) */}
        {activeCoupons.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-green-500" />
                Active Coupons
              </h2>
              <div className="space-y-3">
                {activeCoupons.map((uc) => (
                  <div
                    key={uc.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
                        <Gift className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{uc.coupon.title}</p>
                        <p className="text-xs text-green-500">
                          Active
                          {uc.coupon.category ? ` \u00B7 ${uc.coupon.category}` : ""}
                          {uc.coupon.discountType === "percentage"
                            ? ` \u00B7 ${uc.coupon.discountValue}% off`
                            : ` \u00B7 Rs.${uc.coupon.discountValue} off`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {uc.code}
                      </span>
                      <Link href={`/booking?coupon=${uc.code}`}>
                        <Button size="sm" className="text-xs h-7 px-2">
                          Use
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Redeemed Coupons */}
        {redeemedCoupons.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
                <Ticket className="w-4 h-4 text-gray-400" />
                Redeemed Rewards
              </h2>
              <div className="space-y-3">
                {redeemedCoupons.map((uc) => (
                  <div
                    key={uc.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                        <Ticket className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 line-through">
                          {uc.coupon.title}
                        </p>
                        <p className="text-xs text-green-500">Redeemed</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-400">
                      {uc.code}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spin History */}
        {spinHistory.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-luxury-gold" />
                Recent Spins
              </h2>
              <div className="space-y-2">
                {spinHistory.slice(0, 10).map((spin, i) => (
                  <div
                    key={spin.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        {spinHistory.length - i}
                      </span>
                      <span className="text-sm">{spin.reward}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">
                        {spin.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {spin.couponCode && (
                        <span className="block text-xs font-mono text-green-600">
                          {spin.couponCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {spinHistory.length >= 10 && (
                <div className="text-center mt-4">
                  <Link
                    href="/spin"
                    className="text-sm text-luxury-gold hover:underline"
                  >
                    Spin again &rarr;
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
