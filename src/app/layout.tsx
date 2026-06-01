import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { SeoMetaInjector } from "@/components/seo-meta-injector"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Prisan Beauty | Premium Beauty Salon",
  description:
    "Experience luxury beauty services at Prisan Beauty. Book appointments for hair, nails, skincare, and more.",
  keywords: "beauty salon, Kathmandu, hair styling, skincare, nails, massage",
  openGraph: {
    title: "Prisan Beauty | Premium Beauty Salon",
    description: "Experience luxury beauty services at Prisan Beauty.",
    type: "website",
    locale: "en_US",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <SeoMetaInjector />
      </head>
      <body className="min-h-screen bg-luxury-cream text-luxury-charcoal">
        {children}
      </body>
    </html>
  )
}

