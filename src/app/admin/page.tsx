export const dynamic = "force-dynamic"

import {
  CalendarDays,
  CheckCircle,
  Clock,
  Scissors,
  Users,
  Sparkles,
  Gift,
  Ticket,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Target,
  UserPlus,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getDashboardStats } from "@/lib/actions"
import { formatDateShort, getStatusColor } from "@/lib/utils"
import { WalkinBooking } from "./walkin-booking"
import { NotificationBell } from "@/components/ui/notification-bell"

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const bizCards = [
    { label: "Total Bookings", value: stats.totalBookings, icon: CalendarDays, color: "text-blue-600 bg-blue-100" },
    { label: "Pending", value: stats.pendingBookings, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
    { label: "Confirmed", value: stats.confirmedBookings, icon: CheckCircle, color: "text-green-600 bg-green-100" },
    { label: "Completed", value: stats.completedBookings, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
    { label: "Active Services", value: stats.totalServices, icon: Scissors, color: "text-purple-600 bg-purple-100" },
    { label: "Active Stylists", value: stats.totalStylists, icon: Users, color: "text-pink-600 bg-pink-100" },
  ]

  const spinCards = [
    { label: "Total Spins", value: stats.totalSpins, icon: Sparkles, color: "text-orange-600 bg-orange-100" },
    { label: "Unique Spinners", value: stats.totalSpinUsers, icon: UserPlus, color: "text-indigo-600 bg-indigo-100" },
    { label: "Redeemed Coupons", value: stats.redeemedCoupons, icon: Ticket, color: "text-green-600 bg-green-100" },
    { label: "Active Offers", value: stats.totalOffers, icon: Gift, color: "text-rose-600 bg-rose-100" },
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-cyan-600 bg-cyan-100" },
  ]

  const contentCards = [
    { label: "Blog Posts", value: stats.totalPosts, icon: FileText, color: "text-sky-600 bg-sky-100", href: "/admin/blog" },
    { label: "Gallery Images", value: stats.totalGallery, icon: ImageIcon, color: "text-violet-600 bg-violet-100", href: "/admin/gallery" },
    { label: "Active FAQs", value: stats.totalFaqs, icon: HelpCircle, color: "text-teal-600 bg-teal-100", href: "/admin/faqs" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete overview of your Prisan Beauty business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell role="admin" />
          <WalkinBooking />
        </div>
      </div>

      {/* Business Overview */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Business Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {bizCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-xl font-bold">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Spin & Rewards */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Spin & Rewards
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {spinCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-xl font-bold">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Content Summary */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Content
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {contentCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">{card.label}</p>
                      <p className="text-xl font-bold">{card.value}</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-300" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-xs text-luxury-gold hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2.5 pr-2 font-medium text-gray-500 text-xs">Customer</th>
                    <th className="text-left py-2.5 pr-2 font-medium text-gray-500 text-xs">Service</th>
                    <th className="text-left py-2.5 pr-2 font-medium text-gray-500 text-xs">Date</th>
                    <th className="text-left py-2.5 font-medium text-gray-500 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100">
                      <td className="py-2.5 pr-2 text-sm">{b.customerName}</td>
                      <td className="py-2.5 pr-2">
                        <div className="space-y-0.5">
                          {b.bookingItems?.map((item) => (
                            <div key={item.id} className="text-xs">{item.serviceName}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-sm whitespace-nowrap">
                        {formatDateShort(b.date)} {b.time}
                      </td>
                      <td className="py-2.5">
                        <Badge className={getStatusColor(b.status)}>{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {stats.recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                        No bookings yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Spins */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-luxury-gold" />
                Recent Spins
              </h2>
              <Link href="/admin/analytics" className="text-xs text-luxury-gold hover:underline">
                View analytics
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentSpins.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{s.userName}</p>
                    <p className="text-xs text-gray-500">{s.reward}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {formatDateShort(s.createdAt)}
                    </p>
                    {s.couponCode && (
                      <p className="text-xs font-mono text-green-600">{s.couponCode}</p>
                    )}
                  </div>
                </div>
              ))}
              {stats.recentSpins.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">
                  No spins yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
