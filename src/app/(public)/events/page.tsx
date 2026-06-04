import { auth } from "@/lib/auth"
import { getActiveEvents } from "@/lib/actions"
import { EventBookingForm } from "./event-booking-form"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events | Prisan Beauty",
  description: "Book exclusive beauty events and promotions at Prisan Beauty in Kathmandu.",
}

export default async function EventsPage() {
  const session = await auth()
  const events = await getActiveEvents()

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-luxury-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-luxury-gold" />
          </div>
          <h1 className="text-4xl font-display font-bold text-luxury-charcoal mb-4">
            Special Events
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Take advantage of our limited-time beauty events and promotions.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No upcoming events at this time. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => {
              const isFullyBooked = event.capacity > 0 && event.bookingCount >= event.capacity
              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {event.image && (
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-display font-semibold text-luxury-charcoal">{event.title}</h3>
                      {event.category && (
                        <span className="text-xs text-luxury-gold font-medium uppercase tracking-wide">{event.category}</span>
                      )}
                    </div>
                    {event.description && <p className="text-sm text-gray-600">{event.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.startDate), "MMM d")} — {format(new Date(event.endDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {event.price > 0 ? (
                        <span className="text-lg font-bold text-luxury-gold">{formatPrice(event.price)}</span>
                      ) : (
                        <span className="text-lg font-bold text-green-600">Free</span>
                      )}
                      {event.capacity > 0 && (
                        <span className="text-xs text-gray-400">{event.capacity - event.bookingCount} spots left</span>
                      )}
                    </div>
                    {session?.user ? (
                      <EventBookingForm
                        eventId={event.id}
                        customerName={session.user.name || ""}
                        customerEmail={session.user.email || ""}
                        disabled={isFullyBooked}
                      />
                    ) : (
                      <a
                        href="/login"
                        className="block w-full text-center py-2.5 rounded-xl bg-luxury-gold text-white font-medium text-sm hover:bg-luxury-gold/90 transition-colors"
                      >
                        Sign in to Book
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
