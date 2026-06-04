import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms & Conditions | Prisan Beauty",
  description:
    "Terms and conditions for Prisan Beauty services, bookings, and spin & win promotions.",
}

export default function TermsConditionsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-luxury-charcoal mb-8">
          Terms & Conditions
        </h1>

        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <p className="text-gray-600">
              Last updated: January 2025
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              1. Booking Policy
            </h2>
            <p className="text-gray-600">
              Appointments can be booked through our website or by phone. We
              kindly request 24 hours notice for cancellations. Late
              cancellations may be subject to a fee.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              2. Spin & Win Promotion
            </h2>
            <p className="text-gray-600">
              Each registered customer is eligible to spin the wheel once per
              day. Rewards are non-transferable and cannot be exchanged for cash.
              Coupon codes must be presented at the time of service and have an
              expiry date as specified. Prisan Beauty reserves the right to
              modify or discontinue the promotion at any time.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              3. Services
            </h2>
            <p className="text-gray-600">
              We strive to provide the highest quality beauty services. If you
              are not satisfied with a service, please inform us within 24 hours
              so we can address your concerns.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              4. Pricing
            </h2>
            <p className="text-gray-600">
              All prices are listed in NPR (Nepalese Rupees) and are subject to
              change without notice. Discounts and promotional offers cannot be
              combined unless explicitly stated.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              5. Contact
            </h2>
            <p className="text-gray-600">
              For questions about these terms, contact us at
              prisanbeauty@gmail.com or call 9747226605.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
