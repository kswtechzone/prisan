import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@prisanbeauty.com" },
    update: {},
    create: {
      email: "admin@prisanbeauty.com",
      password: adminPassword,
      name: "Admin",
      role: "admin",
    },
  })

  await Promise.all([
    prisma.stylist.create({
      data: {
        name: "Sophia Chen",
        bio: "Master stylist with 15+ years of experience specializing in precision cuts and balayage.",
      },
    }),
    prisma.stylist.create({
      data: {
        name: "Isabella Martinez",
        bio: "Color specialist known for transformative blonding techniques and creative color.",
      },
    }),
    prisma.stylist.create({
      data: {
        name: "Olivia Williams",
        bio: "Nail artist and skincare expert with a passion for custom designs and facials.",
      },
    }),
    prisma.stylist.create({
      data: {
        name: "Mia Johnson",
        bio: "Makeup artist and aesthetician specializing in bridal and editorial looks.",
      },
    }),
    prisma.stylist.create({
      data: {
        name: "Emma Davis",
        bio: "Massage therapist certified in deep tissue, hot stone, and aromatherapy techniques.",
      },
    }),
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
      content: `## Understand Your Hair Type\n\nKathmandu's unique climate — dry winters and humid monsoons — can take a toll on your hair. Understanding your hair type is the first step to proper care.\n\n## Hydration is Key\n\nDuring the dry months, use a moisturizing shampoo and conditioner. Look for products with natural ingredients like aloe vera and coconut oil.\n\n## Protect from Pollution\n\nThe city's dust and pollution can make hair dull. Cover your hair when outdoors and wash it regularly with a gentle cleanser.\n\n## Regular Trims\n\nVisit your stylist every 6-8 weeks to prevent split ends and maintain healthy growth. At Prisan Beauty, our stylists can recommend the perfect cut for your face shape and lifestyle.`,
      excerpt: "Learn how to protect and nourish your hair in Kathmandu's unique climate conditions.",
      author: "Sophia Chen",
      published: true,
      metaTitle: "Hair Care Tips for Kathmandu — Prisan Beauty",
      metaDescription: "Expert hair care advice for Kathmandu's climate. Learn how to keep your hair healthy through dry winters and humid monsoons.",
      metaKeywords: "hair care, Kathmandu, hair tips, Nepal, Prisan Beauty",
    },
    {
      title: "5 Skincare Trends to Try This Season",
      slug: "skincare-trends-season",
      content: `## Glass Skin\n\nAchieving that dewy, translucent look starts with proper hydration. Layer a hydrating toner, serum, and moisturizer for maximum glow.\n\n## Sustainable Beauty\n\nMore people are choosing eco-friendly, cruelty-free products. We support this shift and recommend brands that prioritize sustainability.\n\n## Facial Massage\n\nRegular facial massage improves circulation and gives your skin a natural lift. Book a facial at Prisan Beauty to experience the benefits.\n\n## Sun Protection\n\nNever skip sunscreen — even on cloudy days in Kathmandu. SPF 50 is your best defense against premature aging.\n\n## Customized Routines\n\nEveryone's skin is different. Visit our skincare specialists for a personalized consultation and product recommendations.`,
      excerpt: "Discover the latest skincare trends from glass skin to sustainable beauty routines.",
      author: "Olivia Williams",
      published: true,
      metaTitle: "5 Skincare Trends to Try — Prisan Beauty Blog",
      metaDescription: "Discover the hottest skincare trends this season. From glass skin to facial massage, find your next glow-up at Prisan Beauty.",
      metaKeywords: "skincare trends, beauty, facial, Kathmandu, Prisan Beauty",
    },
    {
      title: "The Ultimate Guide to Bridal Makeup in Kathmandu",
      slug: "bridal-makeup-guide",
      content: `## Start Early\n\nBegin your skincare routine at least 3 months before your wedding. Healthy skin is the best canvas for makeup.\n\n## Trial Session\n\nAlways schedule a trial session with your makeup artist. This ensures you love the look and it lasts through the event.\n\n## Choose Long-Lasting Products\n\nYour wedding day is long. We use professional-grade, waterproof products that stay flawless from ceremony to reception.\n\n## Trust Your Stylist\n\nAt Prisan Beauty, our bridal team has decades of combined experience. We know what works best for different skin tones, face shapes, and wedding themes.\n\n## Relax and Enjoy\n\nOn your big day, trust your team and enjoy every moment. We handle the beauty — you make the memories.`,
      excerpt: "Everything you need to know about bridal beauty from trial sessions to the big day.",
      author: "Mia Johnson",
      published: true,
      metaTitle: "Bridal Makeup Guide Kathmandu — Prisan Beauty",
      metaDescription: "Complete guide to bridal makeup in Kathmandu. Tips on trials, products, and choosing the right artist for your wedding day.",
      metaKeywords: "bridal makeup, wedding, Kathmandu, Prisan Beauty, bridal beauty",
    },
  ]

  const existingPosts = await prisma.blogPost.count()
  if (existingPosts === 0) {
    await prisma.blogPost.createMany({ data: blogPosts })
  }

  console.log("Seeded admin user, stylists, FAQs, SEO meta, and blog posts")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
