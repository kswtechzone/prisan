import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("Pinky@1234", 12)
  await prisma.user.upsert({
    where: { email: "pinky@prisanbeauty.com" },
    update: {},
    create: {
      email: "pinky@prisanbeauty.com",
      fullName: "Admin",
      password: adminPassword,
      role: "admin",
    },
  })

  await Promise.all([
    prisma.stylist.create({
      data: {
        name: "Priyanka Singh",
        bio: "Master stylist with 15+ years of experience specializing in precision cuts and balayage.",
      },
    })
  ])

  await prisma.seoMeta.upsert({
    where: { page: "home" },
    update: {},
    create: {
      page: "home",
      title: "Prisan Beauty | Premium Beauty Salon in Kathmandu",
      description: "Experience luxury beauty services at Prisan Beauty in Kathmandu. Hair, nails, skincare, massage — book your appointment today.",
      keywords: "beauty salon, Kathmandu, Prisan Beauty, hair styling, skincare, nails, massage, Nepal beauty",
      schemaJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BeautySalon",
        name: "Prisan Beauty",
        image: "/prisanbeautylogo.png",
        url: "https://prisanbeauty.com",
        telephone: "+977-1-4XXXXXX",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Kathmandu",
          addressLocality: "Kathmandu",
          addressCountry: "NP",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 27.7172,
          longitude: 85.3240,
        },
        openingHours: "Mo-Sa 09:00-19:00",
        priceRange: "NPR 500-5000",
        description: "Premium beauty salon in Kathmandu offering hair styling, skincare, nails, and massage services.",
      }),
    },
  })

  const faqs = [
    { question: "How do I book an appointment?", answer: "You can book online through our website's booking page, or call us directly. Select your desired services, stylist, date, and time — we'll confirm your appointment via email.", category: "booking", order: 1 },
    { question: "Can I book multiple services in one appointment?", answer: "Yes! Our booking system allows you to select multiple services in a single appointment. Choose all the services you need and we'll schedule them together.", category: "booking", order: 2 },
    { question: "What is your cancellation policy?", answer: "We kindly ask for at least 24 hours notice for cancellations. Late cancellations may be subject to a fee. You can manage your booking through the confirmation email.", category: "booking", order: 3 },
    { question: "What services do you offer?", answer: "We offer a full range of beauty services including hair cutting and styling, coloring, skincare treatments and facials, manicure and pedicure, massage therapy, and bridal makeup.", category: "services", order: 4 },
    { question: "How much do services cost?", answer: "Our prices vary by service and stylist. You can view our complete price list on the Services page. We accept cash and card payments.", category: "services", order: 5 },
    { question: "How long do appointments typically take?", answer: "Service times vary: haircuts take 30-45 minutes, coloring 1-2 hours, facials 45-60 minutes, and massages 60-90 minutes. Multiple services may require more time.", category: "services", order: 6 },
    { question: "Where are you located?", answer: "We are located in Kathmandu, Nepal. Our exact address and directions are provided when you book an appointment.", category: "general", order: 7 },
    { question: "What payment methods do you accept?", answer: "We accept cash and major credit/debit cards. All prices are in NPR (Nepalese Rupees).", category: "general", order: 8 },
  ]

  const existing = await prisma.faq.count()
  if (existing === 0) {
    await prisma.faq.createMany({ data: faqs })
  }

  const blogPosts = [
    {
      title: "Essential Hair Care Tips for Kathmandu Weather",
      slug: "hair-care-tips-kathmandu",
      content: "## Understand Your Hair Type\n\nKathmandu's unique climate can take a toll on your hair. Understanding your hair type is the first step to proper care.\n\n## Hydration is Key\n\nDuring the dry months, use a moisturizing shampoo and conditioner.\n\n## Regular Trims\n\nVisit your stylist every 6-8 weeks to prevent split ends and maintain healthy growth.",
      excerpt: "Learn how to protect and nourish your hair in Kathmandu's unique climate conditions.",
      author: "Sophia Chen",
      published: true,
      metaTitle: "Hair Care Tips for Kathmandu — Prisan Beauty",
      metaDescription: "Expert hair care advice for Kathmandu's climate.",
      metaKeywords: "hair care, Kathmandu, hair tips, Nepal, Prisan Beauty",
    },
    {
      title: "5 Skincare Trends to Try This Season",
      slug: "skincare-trends-season",
      content: "## Glass Skin\n\nAchieving that dewy look starts with proper hydration.\n\n## Sun Protection\n\nNever skip sunscreen — even on cloudy days in Kathmandu.\n\n## Customized Routines\n\nEveryone's skin is different. Visit our skincare specialists for a personalized consultation.",
      excerpt: "Discover the latest skincare trends from glass skin to sustainable beauty routines.",
      author: "Olivia Williams",
      published: true,
      metaTitle: "5 Skincare Trends to Try — Prisan Beauty Blog",
      metaDescription: "Discover the hottest skincare trends this season.",
      metaKeywords: "skincare trends, beauty, facial, Kathmandu, Prisan Beauty",
    },
    {
      title: "The Ultimate Guide to Bridal Makeup in Kathmandu",
      slug: "bridal-makeup-guide",
      content: "## Start Early\n\nBegin your skincare routine at least 3 months before your wedding.\n\n## Trial Session\n\nAlways schedule a trial session with your makeup artist.\n\n## Trust Your Stylist\n\nAt Prisan Beauty, our bridal team has decades of combined experience.",
      excerpt: "Everything you need to know about bridal beauty from trial sessions to the big day.",
      author: "Mia Johnson",
      published: true,
      metaTitle: "Bridal Makeup Guide Kathmandu — Prisan Beauty",
      metaDescription: "Complete guide to bridal makeup in Kathmandu.",
      metaKeywords: "bridal makeup, wedding, Kathmandu, Prisan Beauty, bridal beauty",
    },
  ]

  const existingPosts = await prisma.blogPost.count()
  if (existingPosts === 0) {
    await prisma.blogPost.createMany({ data: blogPosts })
  }

  const spinOffers = [
    { title: "Better Luck Next Time", description: "Try again next time!", probability: 50, rewardType: "none", color: "#E5E7EB", isActive: true, discountPercent: 0 },
    { title: "5% Off Nail Art", description: "5% discount on any nail art service", probability: 20, rewardType: "discount", couponCode: "NAIL5", color: "#F9A8D4", isActive: true, discountPercent: 5 },
    { title: "10% Makeup Discount", description: "10% off on any makeup service", probability: 12, rewardType: "discount", couponCode: "MAKEUP10", color: "#F472B6", isActive: true, discountPercent: 10 },
    { title: "15% Hair Styling", description: "15% off on hair styling services", probability: 8, rewardType: "discount", couponCode: "HAIR15", color: "#A78BFA", isActive: true, discountPercent: 15 },
    { title: "Free Nail Service", description: "Complimentary basic nail art service", probability: 5, rewardType: "free_service", couponCode: "FREENAIL", color: "#34D399", isActive: true, discountPercent: 100 },
    { title: "Free Hair Spa", description: "Complimentary hair spa treatment", probability: 3, rewardType: "free_service", couponCode: "FREESPA", color: "#60A5FA", isActive: true, discountPercent: 100 },
    { title: "Bridal Package Coupon", description: "20% off on any bridal package", probability: 2, rewardType: "coupon", couponCode: "BRIDAL20", color: "#FBBF24", isActive: true, discountPercent: 20 },
  ]

  const existingOffers = await prisma.spinOffer.count()
  if (existingOffers === 0) {
    await prisma.spinOffer.createMany({ data: spinOffers })
  }

  // ── SpinConfig defaults ──
  const existingConfig = await prisma.spinConfig.count()
  if (existingConfig === 0) {
    await prisma.spinConfig.create({
      data: {
        id: "default",
        dailySpinLimit: 10,
        weeklyClaimPeriodDays: 7,
        antiSpamCooldownMs: 3000,
        stalePendingMinutes: 10,
      },
    })
  }

  console.log("Seeded admin user, stylists, FAQs, SEO meta, blog posts, spin offers, and spin config")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
