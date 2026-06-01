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
  const stylists = await Promise.all([
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

  console.log(`Seeded admin user and ${stylists.length} stylists`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
