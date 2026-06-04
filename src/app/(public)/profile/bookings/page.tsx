import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserBookings } from "@/lib/actions"
import { getUserEventBookings } from "@/lib/actions"
import { Calendar, Scissors, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Bookings | Prisan Beauty",
}

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [serviceBookings, eventBookings] = await Promise.all([
    getUserBookings(),
    getUserEventBookings(),
  ])

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-display font-bold text-luxury-charcoal mb-2">My Bookings</h1>
      <p className="text-sm text-gray-500 mb-8">View all your service and event bookings.</p>

      {serviceBookings.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-luxury-charcoal mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-luxury-gold" /> Service Bookings
          </h2>
          <div className="space-y-3">
            {serviceBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                    booking.status === "completed" ? "bg-blue-100 text-blue-700" :
                    booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {booking.status}
                  </span>
                  <span className="text-xs text-gray-400">#{booking.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-luxury-gold" />
                    {format(new Date(booking.date), "MMMM d, yyyy")} at {booking.time}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <p className="font-medium text-luxury-charcoal">{booking.bookingItems?.map((i: any) => i.serviceName).join(", ")}</p>
                  </div>
                  <p className="text-luxury-gold font-semibold">Rs. {booking.finalAmount || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {eventBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-luxury-charcoal mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-luxury-gold" /> Event Bookings
          </h2>
          <div className="space-y-3">
            {eventBookings.map((eb) => (
              <div key={eb.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-luxury-charcoal">{eb.event.title}</p>
                  <span className="text-xs text-gray-400">
                    {format(new Date(eb.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-luxury-gold" />
                  {format(new Date(eb.event.startDate), "MMM d")} — {format(new Date(eb.event.endDate), "MMM d, yyyy")}
                </div>
                {eb.event.price > 0 && (
                  <p className="text-sm text-luxury-gold font-semibold mt-1">{formatPrice(eb.event.price)}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {serviceBookings.length === 0 && eventBookings.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">No bookings yet.</p>
        </div>
      )}
    </div>
  )
}
