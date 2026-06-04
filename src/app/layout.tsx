import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { SeoMetaInjector } from "@/components/seo-meta-injector"
import { PWARegister } from "@/components/pwa-register"
import { UserActivityTracker } from "@/components/user-activity-tracker"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Prisan Beauty | Best Beauty Studio in Kathmandu Valley Nepal",
  description:
    "Prisan Beauty is a premium beauty studio in Kathmandu Valley offering professional nail art, makeup, bridal beauty services, hair styling, and exclusive spin & win rewards.",
  keywords:
    "best beauty studio Kathmandu, nail art Nepal, bridal makeup Kathmandu, beauty salon Nepal, hair styling Kathmandu Valley, Prisan Beauty, best nail salon in Nepal, professional nail art Kathmandu Valley",
  icons: {
    icon: "/prisanbeautylogo.png",
    apple: "/prisanbeautylogo.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prisan Beauty",
 },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#B8860B",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  openGraph: {
    title: "Prisan Beauty | Best Beauty Studio in Kathmandu Valley Nepal",
    description:
      "Premium beauty studio in Kathmandu Valley offering nail art, bridal makeup, hair styling, and exclusive spin & win rewards.",
    type: "website",
    locale: "en_US",
    siteName: "Prisan Beauty",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://prisanbeauty.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prisan Beauty | Best Beauty Studio in Kathmandu Valley Nepal",
    description:
      "Premium beauty studio in Kathmandu Valley offering nail art, bridal makeup, hair styling, and exclusive spin & win rewards.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <PWARegister />
        <UserActivityTracker />
      </body>
    </html>
  )
}

