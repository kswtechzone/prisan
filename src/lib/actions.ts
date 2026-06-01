"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"
import { login as authLogin, logout as authLogout, requireAdmin } from "./auth"
import { sendBookingConfirmation, sendAdminNotification, sendStatusUpdate } from "./mail"
import { format } from "date-fns"
import type { BookingFormData } from "@/types"

export async function getServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { category: "asc" },
  })
}

export async function getService(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: { bookingItems: true },
  })
}

export async function getStylists() {
  return prisma.stylist.findMany({
    where: { active: true },
  })
}

export async function createBooking(data: BookingFormData) {
  const booking = await prisma.booking.create({
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      stylistId: data.stylistId,
      date: new Date(data.date),
      time: data.time,
      notes: data.notes,
      status: "pending",
      bookingItems: {
        create: data.serviceIds.map((id) => ({ serviceId: id })),
      },
    },
    include: {
      bookingItems: { include: { service: true } },
      stylist: true,
    },
  })

  const formattedDate = format(booking.date, "EEEE, MMMM d, yyyy")
  const names = booking.bookingItems.map((i) => i.service.name).join(", ")
  const total = booking.bookingItems.reduce((s, i) => s + i.service.price, 0)

  try {
    await sendBookingConfirmation({
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      date: formattedDate,
      time: booking.time,
      serviceName: names,
      stylistName: booking.stylist.name,
      price: total,
    })
  } catch (e) {
    console.error("Failed to send confirmation email:", e)
  }

  try {
    await sendAdminNotification({
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: formattedDate,
      time: booking.time,
      serviceName: names,
      stylistName: booking.stylist.name,
      notes: booking.notes,
    })
  } catch (e) {
    console.error("Failed to send admin notification:", e)
  }

  revalidatePath("/admin/bookings")
  return booking
}

export async function getBookings() {
  await requireAdmin()
  return prisma.booking.findMany({
    include: { bookingItems: { include: { service: true } }, stylist: true },
    orderBy: { date: "desc" },
  })
}

export async function getBooking(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: { bookingItems: { include: { service: true } }, stylist: true },
  })
}

export async function updateBookingStatus(id: string, status: string) {
  await requireAdmin()
  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { bookingItems: { include: { service: true } }, stylist: true },
  })

  const formattedDate = format(booking.date, "EEEE, MMMM d, yyyy")
  const names = booking.bookingItems.map((i) => i.service.name).join(", ")

  try {
    await sendStatusUpdate({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      status: booking.status,
      date: formattedDate,
      time: booking.time,
      serviceName: names,
      stylistName: booking.stylist.name,
    })
  } catch (e) {
    console.error("Failed to send status update email:", e)
  }

  revalidatePath("/admin/bookings")
}

export async function deleteService(id: string) {
  await requireAdmin()
  await prisma.bookingItem.deleteMany({ where: { serviceId: id } })
  await prisma.service.delete({ where: { id } })
  revalidatePath("/admin/services")
  revalidatePath("/services")
}

export async function createService(data: {
  name: string
  description: string
  price: number
  duration: number
  category: string
  image?: string
}) {
  await requireAdmin()
  await prisma.service.create({ data })
  revalidatePath("/admin/services")
  revalidatePath("/services")
}

export async function updateService(
  id: string,
  data: {
    name: string
    description: string
    price: number
    duration: number
    category: string
    image?: string
    active?: boolean
  }
) {
  await requireAdmin()
  await prisma.service.update({ where: { id }, data })
  revalidatePath("/admin/services")
  revalidatePath("/services")
}

export async function deleteStylist(id: string) {
  await requireAdmin()
  await prisma.booking.deleteMany({ where: { stylistId: id } })
  await prisma.stylist.delete({ where: { id } })
  revalidatePath("/admin/stylists")
}

export async function createStylist(data: {
  name: string
  bio: string
  image?: string
}) {
  await requireAdmin()
  await prisma.stylist.create({ data })
  revalidatePath("/admin/stylists")
}

export async function updateStylist(
  id: string,
  data: { name?: string; bio?: string; image?: string; active?: boolean }
) {
  await requireAdmin()
  await prisma.stylist.update({ where: { id }, data })
  revalidatePath("/admin/stylists")
}

export async function loginAction(email: string, password: string) {
  return authLogin(email, password)
}

export async function logoutAction() {
  await authLogout()
  redirect("/admin/login")
}

export async function getDashboardStats() {
  await requireAdmin()
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalServices,
    totalStylists,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.booking.count({ where: { status: "confirmed" } }),
    prisma.booking.count({ where: { status: "completed" } }),
    prisma.service.count({ where: { active: true } }),
    prisma.stylist.count({ where: { active: true } }),
  ])

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    include: { bookingItems: { include: { service: true } }, stylist: true },
    orderBy: { createdAt: "desc" },
  })

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalServices,
    totalStylists,
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      customerName: b.customerName,
      customerEmail: b.customerEmail,
      date: b.date,
      time: b.time,
      status: b.status,
      bookingItems: b.bookingItems.map((i) => ({
        id: i.id,
        service: { name: i.service.name },
      })),
    })),
  }
}

export async function getGalleryImages() {
  return prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createGalleryImage(data: {
  url: string
  caption?: string
  category: string
}) {
  await requireAdmin()
  await prisma.galleryImage.create({ data })
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
}

export async function createGalleryImagesBatch(data: {
  urls: string[]
  caption?: string
  category: string
}) {
  await requireAdmin()
  await prisma.galleryImage.createMany({
    data: data.urls.map((url) => ({
      url,
      caption: data.caption || null,
      category: data.category,
    })),
  })
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin()
  await prisma.galleryImage.delete({ where: { id } })
  revalidatePath("/admin/gallery")
  revalidatePath("/gallery")
}

// ── Contact ──

export async function submitContactForm(data: {
  name: string
  phone: string
  email: string
  message: string
}) {
  const { sendContactNotification } = await import("./mail")
  try {
    await sendContactNotification(data)
    return { success: true }
  } catch (e) {
    console.error("Failed to send contact notification:", e)
    return { success: false, error: "Failed to send message. Please try again." }
  }
}

// ── FAQ ──

export async function getFaqs() {
  return prisma.faq.findMany({ orderBy: { order: "asc" } })
}

export async function getActiveFaqs() {
  return prisma.faq.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  })
}

export async function createFaq(data: {
  question: string
  answer: string
  category?: string
  order?: number
}) {
  await requireAdmin()
  await prisma.faq.create({ data })
  revalidatePath("/admin/faqs")
  revalidatePath("/faq")
}

export async function updateFaq(
  id: string,
  data: {
    question?: string
    answer?: string
    category?: string
    order?: number
    active?: boolean
  }
) {
  await requireAdmin()
  await prisma.faq.update({ where: { id }, data })
  revalidatePath("/admin/faqs")
  revalidatePath("/faq")
}

export async function deleteFaq(id: string) {
  await requireAdmin()
  await prisma.faq.delete({ where: { id } })
  revalidatePath("/admin/faqs")
  revalidatePath("/faq")
}

// ── Blog ──

export async function getBlogPosts() {
  return prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } })
}

export async function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getBlogPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } })
}

export async function createBlogPost(data: {
  title: string
  slug: string
  content: string
  excerpt?: string
  image?: string
  author?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}) {
  await requireAdmin()
  await prisma.blogPost.create({ data })
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
}

export async function updateBlogPost(
  id: string,
  data: {
    title?: string
    slug?: string
    content?: string
    excerpt?: string
    image?: string
    author?: string
    published?: boolean
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
  }
) {
  await requireAdmin()
  await prisma.blogPost.update({ where: { id }, data })
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
  revalidatePath(`/blog/${data.slug || ""}`)
}

export async function deleteBlogPost(id: string) {
  await requireAdmin()
  await prisma.blogPost.delete({ where: { id } })
  revalidatePath("/admin/blog")
  revalidatePath("/blog")
}

// ── SEO Meta ──

export async function getSeoMeta(page: string) {
  return prisma.seoMeta.findUnique({ where: { page } })
}

export async function getAllSeoMeta() {
  await requireAdmin()
  return prisma.seoMeta.findMany({ orderBy: { page: "asc" } })
}

export async function upsertSeoMeta(data: {
  page: string
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  schemaJson?: string
}) {
  await requireAdmin()
  await prisma.seoMeta.upsert({
    where: { page: data.page },
    update: data,
    create: data,
  })
  revalidatePath("/admin/seo")
}
