"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { getSpinAnalytics } from "@/lib/actions"
import {
  Sparkles,
  Users,
  Ticket,
  TrendingUp,
  Clock,
  Target,
  Timer,
  BarChart3,
  Trophy,
} from "lucide-react"

interface Analytics {
  totalSpins: number
  uniqueUsers: number
  redeemedCoupons: number
  rewardDistribution: { reward: string; count: number }[]
  recentSpins: any[]
  totalRegisteredUsers: number
  spinsToday: number
  avgSessionSeconds: number
  couponRedemptionRate: number
  dailyUsage7: { date: string; spins: number }[]
  mostActiveUsers: { id: string; name: string; email: string; totalTimeSpent: number }[]
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      const result = await getSpinAnalytics()
      setData(result as unknown as Analytics)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner className="mx-auto mt-12" />

  if (!data) return <p className="text-center text-gray-500 mt-12">Failed to load analytics</p>

  const topStats = [
    { icon: Sparkles, label: "Total Spins", value: data.totalSpins, color: "text-blue-600 bg-blue-50" },
    { icon: Users, label: "Unique Spinners", value: data.uniqueUsers, color: "text-green-600 bg-green-50" },
    { icon: Users, label: "Registered Customers", value: data.totalRegisteredUsers, color: "text-indigo-600 bg-indigo-50" },
    { icon: Target, label: "Spins Today", value: data.spinsToday, color: "text-orange-600 bg-orange-50" },
    { icon: Ticket, label: "Redeemed Coupons", value: data.redeemedCoupons, color: "text-purple-600 bg-purple-50" },
    { icon: TrendingUp, label: "Redemption Rate", value: `${data.couponRedemptionRate}%`, color: "text-emerald-600 bg-emerald-50" },
    { icon: Clock, label: "Avg Session", value: formatTime(data.avgSessionSeconds), color: "text-pink-600 bg-pink-50" },
  ]

  const maxDaily = Math.max(...data.dailyUsage7.map((d) => d.spins), 1)
  const maxCount = Math.max(...data.rewardDistribution.map((r) => r.count), 1)

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-luxury-charcoal mb-2">
        Analytics
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        User engagement, spin performance, and reward tracking
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
        {topStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-luxury-gold" />
              Daily Spins (7 days)
            </h2>
            {data.dailyUsage7.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.dailyUsage7.map((day) => (
                  <div key={day.date}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{formatDate(day.date)}</span>
                      <span className="font-medium">{day.spins} spins</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-luxury-gold rounded-full transition-all"
                        style={{ width: `${(day.spins / maxDaily) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-luxury-gold" />
              Reward Distribution
            </h2>
            {data.rewardDistribution.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No spins recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {data.rewardDistribution.map((item) => (
                  <div key={item.reward}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium truncate">{item.reward}</span>
                      <span className="text-gray-500 shrink-0 ml-2">{item.count} spins</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-luxury-gold rounded-full transition-all"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {data.mostActiveUsers.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-luxury-gold" />
              Most Active Users
            </h2>
            <div className="space-y-3">
              {data.mostActiveUsers.map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-luxury-gold/10 flex items-center justify-center text-xs font-semibold text-luxury-gold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(user.totalTimeSpent)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}
