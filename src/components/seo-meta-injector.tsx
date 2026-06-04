import { prisma } from "@/lib/prisma"

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "Prisan Beauty",
  image: "/prisanbeautylogo.png",
  url: "https://prisanbeauty.com",
  telephone: "+977-9747226605",
  email: "prisanbeauty@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Aloknagar, Baneshwor",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati",
    postalCode: "44600",
    addressCountry: "NP",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 27.6868,
    longitude: 85.324,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  priceRange: "NPR 500-5000",
  description:
    "Premium beauty studio in Kathmandu Valley offering professional nail art, bridal makeup, hair styling, and beauty treatments.",
  sameAs: [
    "https://facebook.com/prisanbeauty",
    "https://instagram.com/prisanbeauty",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Beauty Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nail Art" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hair Styling" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Makeup Services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bridal Packages" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Beauty Treatments" } },
    ],
  },
}

export async function SeoMetaInjector() {
  let dbSchema: string | null = null

  try {
    const home = await prisma.seoMeta.findUnique({ where: { page: "home" } })
    if (home?.schemaJson) {
      dbSchema = home.schemaJson
    }
  } catch {
    // DB not available, use default
  }

  const schemaJson = dbSchema || JSON.stringify(localBusinessSchema)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaJson }}
    />
  )
}
