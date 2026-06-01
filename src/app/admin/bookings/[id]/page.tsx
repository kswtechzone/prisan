export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Clock, User, Phone, Mail, Tag, Scissors, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBooking } from "@/lib/actions"
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils"
import { BookingDetailActions } from "./booking-detail-actions"

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await getBooking(id)
  if (!booking) notFound()

  const total = booking.bookingItems.reduce((s, i) => s + i.service.price, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bookings"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
              Booking #{booking.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">
              Created {formatDate(booking.createdAt)}
            </p>
          </div>
        </div>
        <BookingDetailActions id={booking.id} status={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-luxury-gold" />
                Services
              </h2>
              <div className="space-y-3">
                {booking.bookingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.service.name}</p>
                      <p className="text-xs text-gray-400">{item.service.duration} min</p>
                    </div>
                    <span className="font-semibold text-luxury-gold">
                      {formatPrice(item.service.price)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold text-base">Total</span>
                  <span className="font-bold text-lg text-luxury-gold">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-luxury-gold" />
                Notes
              </h2>
              {booking.notes ? (
                <p className="text-gray-600 text-sm leading-relaxed">{booking.notes}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">No notes provided.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Appointment</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-sm">{formatDate(booking.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-sm">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Customer</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-sm">{booking.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-sm break-all">{booking.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-sm">{booking.customerPhone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Stylist</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {booking.stylist.image ? (
                    <img src={booking.stylist.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-luxury-gold" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{booking.stylist.name}</p>
                  <p className="text-xs text-gray-400">{booking.stylist.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-luxury-gold" />
                    <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Booking Created</p>
                    <p className="text-xs text-gray-400">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>
                {booking.updatedAt > booking.createdAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-gray-400">{formatDate(booking.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
