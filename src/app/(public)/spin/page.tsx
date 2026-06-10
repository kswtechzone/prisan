import { SpinWheel } from "@/components/spin-wheel"
import { getActiveOffers, getRemainingSpins, getWeeklyCouponStatus } from "@/lib/actions"
import { spinAction } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Spin & Win | Prisan Beauty",
  description:
    "Spin the wheel and win exclusive beauty rewards at Prisan Beauty. Discounts, free services, and bridal offers await!",
  keywords:
    "spin and win, beauty rewards, Prisan Beauty, Kathmandu, beauty discounts, free beauty services",
  openGraph: {
    title: "Spin & Win — Prisan Beauty",
    description:
      "Try your luck and win exclusive beauty rewards at Prisan Beauty in Kathmandu.",
  },
}

export default async function SpinPage() {
  const session = await auth()
  const [offers, remainingSpins, weeklyStatus] = await Promise.all([
    getActiveOffers(),
    getRemainingSpins(),
    getWeeklyCouponStatus(),
  ])

  const segments = offers
    .filter((o) => o.rewardType !== "none")
    .map((o) => ({
      label: o.title,
      probability: o.probability,
      color: o.color || "#8B5E3C",
    }))

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="hidden md:flex justify-center mb-4">
            <div className="w-16 h-16 bg-luxury-gold/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-luxury-gold" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-luxury-charcoal mb-4">
            Spin & Win
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Try your luck and win exclusive beauty rewards! Discounts, free
            services, and premium offers — all just a spin away.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <SpinWheel
            segments={segments}
            onSpin={async () => {
              "use server"
              return spinAction()
            }}
            initialRemaining={remainingSpins}
            initialWeeklyStatus={weeklyStatus}
            isAuthenticated={!!session?.user}
          />
        </div>

        <div className="bg-gradient-to-r from-luxury-gold/5 to-luxury-champagne rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-luxury-charcoal mb-6 text-center">
            Available Rewards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offers
              .filter((o) => o.rewardType !== "none")
              .map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm"
                >
                  <div
                    className="w-10 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: (offer.color || "#8B5E3C") + "20" }}
                  />
                  <div>
                    <p className="font-semibold text-sm">{offer.title}</p>
                    {offer.description && (
                      <p className="text-xs text-gray-500">{offer.description}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/rewards"
              className="text-sm text-luxury-gold hover:underline font-medium"
            >
              View all rewards &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
