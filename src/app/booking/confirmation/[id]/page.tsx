export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getBooking } from "@/lib/actions"
import { formatDate, formatPrice } from "@/lib/utils"

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await getBooking(id)
  if (!booking) notFound()

  const total = booking.bookingItems.reduce((s, i) => s + i.service.price, 0)

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Image src="/pblogo.png" alt="PB Logo" width={64} height={64} className="rounded-2xl" />
        </div>

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-display font-bold text-luxury-charcoal mb-4">
          Thank You, {booking.customerName}!
        </h1>
        <p className="text-gray-600 mb-8">
          Your appointment has been booked successfully. We look forward to
          seeing you!
        </p>

        <Card className="text-left">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">
              Booking Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs block mb-1">Services</span>
                <div className="space-y-1">
                  {booking.bookingItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="font-medium">{item.service.name}</span>
                      <span className="text-luxury-gold">{formatPrice(item.service.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-luxury-gold">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stylist</span>
                <span className="font-medium">{booking.stylist.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">
                  {formatDate(booking.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium capitalize">{booking.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Confirmation</span>
                <span className="font-mono text-xs text-gray-400">
                  #{booking.id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Link href="/booking">
            <Button>Book Another</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
