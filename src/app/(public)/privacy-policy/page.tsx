import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy | Prisan Beauty",
  description:
    "Privacy policy for Prisan Beauty. Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-luxury-charcoal mb-8">
          Privacy Policy
        </h1>

        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <p className="text-gray-600">
              Last updated: January 2025
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-600">
              We collect information you provide directly to us, including your
              name, email address, phone number, and address when you register
              for an account, book a service, or participate in our spin & win
              promotions.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-600">
              We use the information we collect to provide, maintain, and
              improve our services, process your bookings and rewards, send you
              appointment confirmations and reminders, and communicate with you
              about promotions and offers.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              3. Data Protection
            </h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your
              personal information. Your password is encrypted and we do not
              share your personal data with third parties without your consent.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              4. Cookies
            </h2>
            <p className="text-gray-600">
              We use essential cookies for authentication and session
              management. By using our website, you consent to the use of these
              cookies.
            </p>

            <h2 className="text-xl font-display font-semibold mt-8 mb-4">
              5. Contact
            </h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please
              contact us at prisanbeauty@gmail.com or call 9747226605.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
