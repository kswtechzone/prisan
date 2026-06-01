export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Image from "next/image"
import { HelpCircle, ChevronDown } from "lucide-react"
import { getActiveFaqs } from "@/lib/actions"
import { FaqContent } from "./faq-content"

export const metadata: Metadata = {
  title: "FAQ — Prisan Beauty",
  description: "Frequently asked questions about Prisan Beauty salon services, bookings, pricing, and more.",
}

export default async function FaqPage() {
  const faqs = await getActiveFaqs()

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Image
                src="/prisanbeautylogo.png"
                alt="Prisan Beauty"
                width={64}
                height={64}
                className="rounded-2xl"
                unoptimized
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Everything you need to know about our services, booking, and salon experience.
            </p>
          </div>

          <FaqContent faqs={faqs} />
        </div>
      </div>
    </>
  )
}
