import { Gift, Sparkles, Percent, Scissors } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getActiveOffers } from "@/lib/actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rewards & Offers | Prisan Beauty",
  description:
    "Explore exclusive beauty rewards, discounts, and offers at Prisan Beauty. From nail art discounts to bridal package deals.",
  keywords:
    "beauty rewards, offers, discounts, Prisan Beauty, Kathmandu, bridal deals",
  openGraph: {
    title: "Rewards & Offers — Prisan Beauty",
    description:
      "Exclusive beauty rewards and discounts at Prisan Beauty in Kathmandu Valley.",
  },
}

const rewardIcons: Record<string, any> = {
  discount: Percent,
  free_service: Gift,
  coupon: Sparkles,
  gift: Gift,
  none: Scissors,
}

export default async function RewardsPage() {
  const offers = await getActiveOffers()

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-luxury-gold/10 rounded-2xl flex items-center justify-center">
              <Gift className="w-8 h-8 text-luxury-gold" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-luxury-charcoal mb-4">
            Rewards & Offers
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Explore all the exclusive rewards you can win at Prisan Beauty. Spin
            the wheel for your chance to claim these offers!
          </p>
          <div className="mt-6">
            <Link href="/spin">
              <Button size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Spin to Win
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers
            .filter((o) => o.rewardType !== "none")
            .map((offer) => {
              const Icon = rewardIcons[offer.rewardType] || Gift
              return (
                <Card
                  key={offer.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        backgroundColor: (offer.color || "#8B5E3C") + "20",
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: offer.color || "#8B5E3C" }}
                      />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {offer.description}
                      </p>
                    )}
                    {offer.couponCode && (
                      <div className="flex items-center text-sm">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {offer.couponCode}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>

        {offers.filter((o) => o.rewardType === "none").length > 0 && (
          <div className="mt-12 text-center">
            <Card className="bg-gray-50">
              <CardContent className="p-8">
                <p className="text-gray-500 text-sm">
                  Don&apos;t worry if you get &quot;Better Luck Next Time&quot;
                  — you can spin again! Every visit is a new chance to win.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
