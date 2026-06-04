export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CheckCircle, CreditCard, Building2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getBooking, setBookingPayment, getPaymentConfig } from "@/lib/actions"
import { formatDate, formatPrice } from "@/lib/utils"

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [booking, paymentConfig] = await Promise.all([
    getBooking(id),
    getPaymentConfig(),
  ])
  if (!booking) notFound()

  const total = booking.bookingItems.reduce((s, i) => s + i.servicePrice, 0)
  const finalTotal = booking.finalAmount ?? (booking.discountAmount ? total - booking.discountAmount : total)
  const needsPayment = booking.status === "pending"
  const payAtStoreDone = booking.status === "confirmed"
  const payingOnline = booking.status === "awaiting_payment"

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Image src="/prisanbeautylogo.png" alt="PB Logo" width={64} height={64} className="rounded-2xl" unoptimized />
        </div>

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-display font-bold text-luxury-charcoal mb-4">
          Thank You, {booking.customerName}!
        </h1>
        <p className="text-gray-600 mb-8">
          Your appointment has been booked successfully.
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
                  {booking.bookingItems.map((item) => {
                    const dPrice = item.discountedPrice ?? item.servicePrice
                    const hasDiscount = dPrice < item.servicePrice
                    return (
                      <div key={item.id} className="flex justify-between">
                        <span className="font-medium">{item.serviceName}</span>
                        <span className={hasDiscount ? "text-green-600" : "text-luxury-gold"}>
                          {formatPrice(dPrice)}
                          {hasDiscount && (
                            <span className="line-through text-gray-400 ml-1.5 text-xs">
                              {formatPrice(item.servicePrice)}
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {booking.discountAmount && booking.discountAmount > 0 ? (
                  <>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm text-green-600">
                      <span>Discount ({booking.discountPercent}%)</span>
                      <span>-{formatPrice(booking.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base mt-1">
                      <span>Final Total</span>
                      <span className="text-luxury-gold">{formatPrice(finalTotal)}</span>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-luxury-gold">{formatPrice(total)}</span>
                  </div>
                )}
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
                <span className="text-gray-500">Confirmation</span>
                <span className="font-mono text-xs text-gray-400">
                  #{booking.id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment section */}
        {needsPayment && (
          <Card className="text-left mt-6 border-amber-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="font-display font-semibold text-lg">
                  Complete Your Booking
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Please choose a payment method to confirm your appointment.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Your booking is currently <strong>pending</strong>. Confirm
                    it now to secure your slot.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <form
                  action={async () => {
                    "use server"
                    await setBookingPayment(booking.id, "store")
                  }}
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4 px-5"
                  >
                    <Building2 className="w-5 h-5 text-luxury-gold" />
                    <div className="text-left">
                      <div className="font-medium">Pay at Store</div>
                      <div className="text-xs text-gray-500 font-normal">
                        Pay when you visit — cash, card, or mobile payment
                      </div>
                    </div>
                  </Button>
                </form>

                <form
                  action={async () => {
                    "use server"
                    await setBookingPayment(booking.id, "online")
                  }}
                >
                  <Button
                    type="submit"
                    className="w-full justify-start gap-3 h-auto py-4 px-5"
                  >
                    <CreditCard className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Pay Online</div>
                      <div className="text-xs text-white/80 font-normal">
                        Bank transfer, eSewa, Khalti, or card
                      </div>
                    </div>
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        {payAtStoreDone && (
          <Card className="text-left mt-6 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Building2 className="w-5 h-5" />
                <h3 className="font-semibold">Pay at Store</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your booking is confirmed. Please pay at the store when you
                arrive. We accept cash, card, eSewa, and Khalti.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Total due: <strong className="text-luxury-charcoal">{formatPrice(finalTotal)}</strong>
              </div>
            </CardContent>
          </Card>
        )}

        {payingOnline && (
          <Card className="text-left mt-6 border-blue-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-semibold">Pay Online</h3>
              </div>
              <p className="text-sm text-gray-600">
                Transfer the total amount to any of the following and send us
                the receipt. Your booking will be confirmed once payment is
                verified.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Total Amount</div>
                  <div className="text-xl font-bold text-luxury-charcoal">
                    {formatPrice(finalTotal)}
                  </div>
                </div>
                {(paymentConfig?.bankName || paymentConfig?.bankAccount) && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-gray-500 text-xs mb-1">Bank Transfer</div>
                    {paymentConfig.bankHolder && (
                      <div className="font-medium">{paymentConfig.bankHolder}</div>
                    )}
                    {paymentConfig.bankName && (
                      <div className="text-gray-600">{paymentConfig.bankName}</div>
                    )}
                    {paymentConfig.bankAccount && (
                      <div className="text-gray-600">
                        Account: {paymentConfig.bankAccount}
                      </div>
                    )}
                  </div>
                )}
                {(paymentConfig?.esewaNumber || paymentConfig?.khaltiNumber) && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-gray-500 text-xs mb-1">Mobile Payments</div>
                    {paymentConfig.esewaNumber && (
                      <div className="font-medium">eSewa: {paymentConfig.esewaNumber}</div>
                    )}
                    {paymentConfig.khaltiNumber && (
                      <div className="font-medium">Khalti: {paymentConfig.khaltiNumber}</div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400">
                After payment, please contact us at{" "}
                <strong>prisanbeauty@gmail.com</strong> or call with your
                booking confirmation number (#
                {booking.id.slice(-8).toUpperCase()}) to confirm your payment.
              </p>
            </CardContent>
          </Card>
        )}

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
