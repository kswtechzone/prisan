export const dynamic = "force-dynamic"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getBookings } from "@/lib/actions"
import { formatDateShort, getStatusColor } from "@/lib/utils"
import { BookingActions } from "./booking-actions"
import { BookingsFilter } from "./bookings-filter"

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  let bookings = await getBookings()

  if (status && status !== "all") {
    bookings = bookings.filter((b) => b.status === status)
  }

  if (q) {
    const query = q.toLowerCase()
    bookings = bookings.filter(
      (b) =>
        b.customerName.toLowerCase().includes(query) ||
        b.customerEmail.toLowerCase().includes(query) ||
        b.stylist.name.toLowerCase().includes(query) ||
        b.bookingItems.some((i) => i.service.name.toLowerCase().includes(query))
    )
  }

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
          Bookings
        </h1>
      </div>

      <BookingsFilter
        currentStatus={status || "all"}
        currentQuery={q || ""}
        counts={statusCounts}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Stylist
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-xs text-gray-400">{b.customerEmail}</div>
                      <div className="text-xs text-gray-400">{b.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {b.bookingItems.map((item) => (
                          <div key={item.id} className="text-sm">{item.service.name}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">{b.stylist.name}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatDateShort(b.date)} at {b.time}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(b.status)}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <BookingActions id={b.id} status={b.status} />
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">
                      <div className="text-lg mb-1">No bookings found</div>
                      <div className="text-sm">
                        {status && status !== "all"
                          ? `No bookings with status "${status}".`
                          : q
                            ? `No results matching "${q}".`
                            : "No bookings yet. They will appear here once customers book appointments."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
