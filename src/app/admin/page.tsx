export const dynamic = "force-dynamic"

import {
  CalendarDays,
  CheckCircle,
  Clock,
  Scissors,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDashboardStats } from "@/lib/actions"
import { formatDateShort, getStatusColor } from "@/lib/utils"
import { WalkinBooking } from "./walkin-booking"

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Pending",
      value: stats.pendingBookings,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Confirmed",
      value: stats.confirmedBookings,
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Completed",
      value: stats.completedBookings,
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Active Services",
      value: stats.totalServices,
      icon: Scissors,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Active Stylists",
      value: stats.totalStylists,
      icon: Users,
      color: "text-pink-600 bg-pink-100",
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
          Dashboard
        </h1>
        <WalkinBooking />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-display font-semibold mb-4">
            Recent Bookings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Service
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="py-3 px-2">{b.customerName}</td>
                    <td className="py-3 px-2">
                      <div className="space-y-0.5">
                        {b.bookingItems?.map((item) => (
                          <div key={item.id} className="text-sm">{item.service.name}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {formatDateShort(b.date)} at {b.time}
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={getStatusColor(b.status)}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
