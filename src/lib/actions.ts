"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"
import { auth, signIn, signOut } from "./auth"
import { sendBookingConfirmation, sendAdminNotification, sendStatusUpdate } from "./mail"
import { format } from "date-fns"
import type { BookingFormData, CouponValidationResult } from "@/types"
import { calculateInvoice, type CouponInfo } from "./billing"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return session.user
}

async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")
  return session.user.id
}

// ── Services ──

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

// ── Coupon Validation Engine ──

export async function validateCoupon(code: string, serviceIds?: string[]): Promise<CouponValidationResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { valid: false, message: "Please log in to use a coupon" }
  }
  const userId = session.user.id

  // Step 1: Check UserCoupon (user-specific private coupons from spin game)
  const userCoupon = await prisma.userCoupon.findUnique({
    where: { code },
    include: { coupon: true },
  })

  if (userCoupon) {
    // Secure ownership check — only the owner can redeem
    if (userCoupon.userId !== userId) {
      return { valid: false, message: "This coupon does not belong to your account" }
    }
    if (userCoupon.isRedeemed) {
      return { valid: false, message: "This coupon has already been redeemed" }
    }

    const coupon = userCoupon.coupon
    if (!coupon.isActive) {
      return { valid: false, message: "This coupon is no longer active" }
    }
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return { valid: false, message: "This coupon has expired" }
    }
    if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
      return { valid: false, message: "This coupon has reached its usage limit" }
    }

    return {
      valid: true,
      discountType: coupon.discountType as "percentage" | "fixed" | "full_service",
      discountValue: coupon.discountValue,
      discountPercent: coupon.discountPercent ?? undefined,
      reward: coupon.title,
      category: coupon.category,
      couponId: coupon.id,
      userCouponId: userCoupon.id,
      couponCode: code,
      title: coupon.title,
      allowedServices: coupon.allowedServices,
      minimumAmount: coupon.minimumAmount ?? 0,
    }
  }

  // Step 2: Check public CouponCode (general/referral, any authenticated user)
  const publicCoupon = await prisma.couponCode.findUnique({
    where: { code },
  })

  if (publicCoupon) {
    if (!publicCoupon.isActive) {
      return { valid: false, message: "This coupon code is no longer active" }
    }
    if (publicCoupon.expiryDate && publicCoupon.expiryDate < new Date()) {
      return { valid: false, message: "This coupon has expired" }
    }
    if (publicCoupon.maxUsage > 0 && publicCoupon.usedCount >= publicCoupon.maxUsage) {
      return { valid: false, message: "This coupon code has reached its usage limit" }
    }

    return {
      valid: true,
      discountType: publicCoupon.discountType as "percentage" | "fixed" | "full_service",
      discountValue: publicCoupon.discountValue,
      discountPercent: publicCoupon.discountPercent ?? undefined,
      reward: publicCoupon.title,
      category: publicCoupon.category,
      couponId: publicCoupon.id,
      couponCode: code,
      title: publicCoupon.title,
      allowedServices: publicCoupon.allowedServices,
      minimumAmount: publicCoupon.minimumAmount ?? 0,
    }
  }

  // Step 3: Legacy spin history check (backward compat)
  const spinRecord = await prisma.spinHistory.findFirst({
    where: {
      userId,
      couponCode: code,
      status: "active",
    },
    include: { offer: true },
  })

  if (spinRecord) {
    if (spinRecord.expiryDate && spinRecord.expiryDate < new Date()) {
      return { valid: false, message: "This coupon has expired" }
    }
    return {
      valid: true,
      discountType: (spinRecord.discountType as "percentage" | "fixed" | "full_service") || "percentage",
      discountValue: spinRecord.discountValue ?? spinRecord.discountPercent ?? 0,
      discountPercent: spinRecord.discountPercent ?? undefined,
      reward: spinRecord.reward,
      category: spinRecord.category || null,
      couponCode: code,
    }
  }

  return { valid: false, message: "Invalid or expired coupon code" }
}

// ── Booking with billing engine ──

export async function createBooking(data: BookingFormData) {
  const session = await auth()

  let couponRecord: CouponValidationResult | null = null
  let couponInfo: CouponInfo | null = null

  if (data.couponCode) {
    const result = await validateCoupon(data.couponCode, data.serviceIds)
    if (!result.valid) {
      throw new Error(result.message)
    }
    couponRecord = result

    // Build CouponInfo for billing engine
    if (result.couponId) {
      const dbCoupon = await prisma.couponCode.findUnique({
        where: { id: result.couponId },
      })
      if (dbCoupon) {
        couponInfo = {
          id: dbCoupon.id,
          code: dbCoupon.code,
          title: dbCoupon.title,
          discountType: dbCoupon.discountType as "percentage" | "fixed" | "full_service",
          discountValue: dbCoupon.discountValue,
          discountPercent: dbCoupon.discountPercent,
          category: dbCoupon.category,
          allowedServices: dbCoupon.allowedServices,
          minimumAmount: dbCoupon.minimumAmount ?? 0,
        }
      }
    }
  }

  // Fetch service details for billing
  const selectedServices = await prisma.service.findMany({
    where: { id: { in: data.serviceIds } },
  })

  // Calculate invoice
  const services = selectedServices.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    category: s.category,
  }))

  const invoice = calculateInvoice(services, couponInfo)
  const discountAmount = invoice.totalDiscount
  const discountPercent = couponInfo?.discountPercent ?? 0

  // Create booking with price snapshots
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
      userId: session?.user?.id || null,
      couponCode: data.couponCode || null,
      couponId: couponRecord?.couponId || null,
      discountPercent,
      discountAmount,
      totalBeforeDiscount: invoice.subtotal,
      finalAmount: invoice.finalAmount,
      bookingItems: {
        create: invoice.lineItems.map((li) => ({
          serviceId: li.serviceId,
          serviceName: li.serviceName,
          servicePrice: li.originalPrice,
          discountedPrice: li.discountedPrice,
        })),
      },
    },
    include: {
      bookingItems: { include: { service: true } },
      stylist: true,
    },
  })

  // Mark coupon as redeemed
  if (couponRecord) {
    // New path: UserCoupon
    if (couponRecord.userCouponId) {
      await prisma.userCoupon.update({
        where: { id: couponRecord.userCouponId },
        data: { isRedeemed: true, redeemedAt: new Date() },
      })
    }
    // New path: CouponCode (public) — increment usage
    if (couponRecord.couponId && !couponRecord.userCouponId) {
      await prisma.couponCode.update({
        where: { id: couponRecord.couponId },
        data: { usedCount: { increment: 1 } },
      })
    }
    // Legacy path: SpinHistory
    if (!couponRecord.couponId && !couponRecord.userCouponId) {
      const spinRecord = await prisma.spinHistory.findFirst({
        where: { couponCode: data.couponCode, status: "active" },
      })
      if (spinRecord) {
        await prisma.spinHistory.update({
          where: { id: spinRecord.id },
          data: { status: "redeemed" },
        })
      }
    }

    // Record usage
    if (couponRecord.couponId && session?.user?.id) {
      await prisma.couponUsage.create({
        data: {
          couponId: couponRecord.couponId,
          userId: session.user.id,
          bookingId: booking.id,
          discountAmount,
        },
      }).catch(() => {}) // non-critical
    }
  }

  const formattedDate = format(booking.date, "EEEE, MMMM d, yyyy")

  try {
    await sendBookingConfirmation({
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      date: formattedDate,
      time: booking.time,
      serviceName: booking.bookingItems.map((i) => i.serviceName).join(", "),
      stylistName: booking.stylist.name,
      price: invoice.finalAmount,
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
      serviceName: booking.bookingItems.map((i) => i.serviceName).join(", "),
      stylistName: booking.stylist.name,
      notes: booking.notes,
    })
  } catch (e) {
    console.error("Failed to send admin notification:", e)
  }

  // In-app notification for admin
  await prisma.notification.create({
    data: {
      role: "admin",
      title: "New Booking",
      message: `${booking.customerName} booked ${booking.bookingItems.length} service(s) on ${formattedDate}`,
      link: `/admin/bookings`,
      type: "booking",
    },
  }).catch(() => {})

  // In-app notification for user (if logged in)
  if (session?.user?.id) {
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Booking Confirmed",
        message: `Your booking for ${formattedDate} at ${booking.time} is confirmed`,
        link: `/booking/confirmation/${booking.id}`,
        type: "booking",
      },
    }).catch(() => {})
  }

  revalidatePath("/admin/bookings")
  return booking
}

// ── Bookings ──

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
    include: { bookingItems: { include: { service: true } }, stylist: true, coupon: true },
  })
}

export async function getUserBookings() {
  const session = await auth()
  if (!session?.user?.id) return []
  return prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { bookingItems: true, stylist: true },
    orderBy: { date: "desc" },
  })
}

export async function setBookingPayment(bookingId: string, method: "store" | "online") {
  const session = await auth()

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new Error("Booking not found")

  if (booking.userId && booking.userId !== session?.user?.id) {
    throw new Error("This booking does not belong to your account")
  }

  const status = method === "store" ? "confirmed" : "awaiting_payment"

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  })

  revalidatePath(`/booking/confirmation/${bookingId}`)
  revalidatePath("/admin/bookings")
}

export async function updateBookingStatus(id: string, status: string) {
  await requireAdmin()
  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { bookingItems: { include: { service: true } }, stylist: true },
  })

  const formattedDate = format(booking.date, "EEEE, MMMM d, yyyy")
  const names = booking.bookingItems.map((i) => i.serviceName).join(", ")

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
  await prisma.bookingService.deleteMany({ where: { serviceId: id } })
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
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      return { error: "Invalid email or password" }
    }
    return { success: true }
  } catch {
    return { error: "Invalid email or password" }
  }
}

export async function logoutAction() {
  await signOut({ redirect: false })
  redirect("/admin/login")
}

export async function customerLogout() {
  await signOut({ redirectTo: "/" })
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
    totalCustomers,
    totalSpins,
    totalSpinUsers,
    redeemedCoupons,
    totalPosts,
    totalGallery,
    totalFaqs,
    totalOffers,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.booking.count({ where: { status: "confirmed" } }),
    prisma.booking.count({ where: { status: "completed" } }),
    prisma.service.count({ where: { active: true } }),
    prisma.stylist.count({ where: { active: true } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.spinHistory.count(),
    prisma.spinHistory.groupBy({ by: ["userId"] }).then((r) => r.length),
    prisma.couponUsage.count(),
    prisma.blogPost.count(),
    prisma.galleryImage.count(),
    prisma.faq.count({ where: { active: true } }),
    prisma.spinOffer.count({ where: { isActive: true } }),
  ])

  const [recentBookings, recentSpins, couponStats] = await Promise.all([
    prisma.booking.findMany({
      take: 5,
      include: { bookingItems: { include: { service: true } }, stylist: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.spinHistory.findMany({
      take: 5,
      include: { user: { select: { fullName: true } }, offer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.couponUsage.groupBy({
      by: ["couponId"],
      _count: true,
      _sum: { discountAmount: true },
      orderBy: { _count: { couponId: "desc" } },
      take: 10,
    }),
  ])

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalServices,
    totalStylists,
    totalCustomers,
    totalSpins,
    totalSpinUsers,
    redeemedCoupons,
    totalPosts,
    totalGallery,
    totalFaqs,
    totalOffers,
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      customerName: b.customerName,
      customerEmail: b.customerEmail,
      date: b.date,
      time: b.time,
      status: b.status,
      bookingItems: b.bookingItems.map((i) => ({
        id: i.id,
        serviceName: i.serviceName,
      })),
    })),
    recentSpins: recentSpins.map((s) => ({
      id: s.id,
      userName: s.user.fullName,
      reward: s.reward,
      couponCode: s.couponCode,
      createdAt: s.createdAt,
    })),
    topCoupons: couponStats,
  }
}

// ── Gallery ──

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

// ── Payment Config ──

export async function getPaymentConfig() {
  const config = await prisma.paymentConfig.findFirst()
  return config || {
    id: "",
    bankName: null,
    bankAccount: null,
    bankHolder: null,
    esewaNumber: null,
    khaltiNumber: null,
  }
}

export async function updatePaymentConfig(data: {
  bankName?: string
  bankAccount?: string
  bankHolder?: string
  esewaNumber?: string
  khaltiNumber?: string
}) {
  await requireAdmin()

  const existing = await prisma.paymentConfig.findFirst()
  if (existing) {
    await prisma.paymentConfig.update({
      where: { id: existing.id },
      data,
    })
  } else {
    await prisma.paymentConfig.create({
      data: data as any,
    })
  }

  revalidatePath("/admin/settings")
}

// ── Spin ──

export async function spinAction() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        error: true,
        message: "Please log in to spin",
        offerId: null,
        reward: "Not logged in",
        couponCode: null,
        color: "#EF4444",
      }
    }
    const { spin } = await import("./spin")
    return spin()
  } catch (e: any) {
    return {
      error: true,
      message: e.message || "Something went wrong",
      offerId: null,
      reward: "Error",
      couponCode: null,
      color: "#EF4444",
    }
  }
}

export async function confirmSpin(spinHistoryId: string) {
  const { confirmSpin } = await import("./spin")
  await confirmSpin(spinHistoryId)
}

export async function skipSpin(spinHistoryId: string) {
  const { skipSpin } = await import("./spin")
  await skipSpin(spinHistoryId)
}

export async function getRemainingSpins() {
  const { getRemainingSpins } = await import("./spin")
  return getRemainingSpins()
}

export async function getWeeklyCouponStatus() {
  const { getWeeklyCouponStatus } = await import("./spin")
  return getWeeklyCouponStatus()
}

export async function getActiveOffers() {
  const { getActiveOffers } = await import("./spin")
  return getActiveOffers()
}

export async function getMySpinHistory() {
  const session = await auth()
  if (!session?.user?.id) return []
  const { getSpinHistory } = await import("./spin")
  return getSpinHistory(session.user.id)
}

export async function getMyRewards() {
  const session = await auth()
  if (!session?.user?.id) return []
  const { getUserRewards } = await import("./spin")
  return getUserRewards(session.user.id)
}

export async function redeemCoupon(spinHistoryId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  await prisma.spinHistory.update({
    where: { id: spinHistoryId, userId: session.user.id },
    data: { status: "redeemed" },
  })

  revalidatePath("/profile")
  revalidatePath("/admin/offers")
}

// ── User Coupons (new) ──

export async function getUserCoupons() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.userCoupon.findMany({
    where: { userId: session.user.id },
    include: { coupon: true },
    orderBy: { assignedAt: "desc" },
  })
}

export async function getCurrentUserProfile() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, email: true, mobile: true },
  })
  return user
}

// ── Activity Tracking ──

export async function updateUserActivity(elapsed: number) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totalTimeSpent: { increment: elapsed },
      lastActiveAt: new Date(),
    },
  })
}

export async function startSession() {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.userSession.create({
    data: {
      userId: session.user.id,
      sessionStart: new Date(),
    },
  })
}

export async function endSession() {
  const session = await auth()
  if (!session?.user?.id) return

  const lastSession = await prisma.userSession.findFirst({
    where: { userId: session.user.id, sessionEnd: null },
    orderBy: { sessionStart: "desc" },
  })

  if (!lastSession) return

  const duration = Math.round((Date.now() - lastSession.sessionStart.getTime()) / 1000)

  await prisma.userSession.update({
    where: { id: lastSession.id },
    data: {
      sessionEnd: new Date(),
      activeDuration: duration,
    },
  })
}

// ── Customer Registration ──

export async function registerUser(data: {
  fullName: string
  email: string
  mobile: string
  address: string
  password: string
}) {
  const { hash } = await import("bcryptjs")

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  })
  if (existing) {
    return { error: "Email already registered" }
  }

  const hashedPassword = await hash(data.password, 12)

  await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      address: data.address,
      password: hashedPassword,
      role: "customer",
      lastLoginAt: new Date(),
    },
  })

  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  })

  return { success: true, redirect: "/profile" }
}

// ── Admin: Coupon Management (new unified) ──

export async function getAdminCoupons() {
  await requireAdmin()
  return prisma.couponCode.findMany({
    include: {
      _count: { select: { usage: true, userCoupons: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createAdminCoupon(data: {
  code: string
  title: string
  description?: string
  couponType: string
  discountType: string
  discountValue: number
  discountPercent?: number
  category?: string
  allowedServices?: string[]
  isPublic: boolean
  minimumAmount?: number
  maxUsage: number
  expiryDate?: string
}) {
  await requireAdmin()
  const existing = await prisma.couponCode.findUnique({ where: { code: data.code } })
  if (existing) {
    throw new Error("A coupon code with this name already exists")
  }
  await prisma.couponCode.create({
    data: {
      code: data.code.toUpperCase(),
      title: data.title,
      description: data.description,
      couponType: data.couponType,
      discountType: data.discountType,
      discountValue: data.discountValue,
      discountPercent: data.discountPercent ?? (data.discountType === "percentage" ? Math.round(data.discountValue ?? 0) : null),
      category: data.category || null,
      allowedServices: data.allowedServices || [],
      isPublic: data.isPublic,
      minimumAmount: data.minimumAmount || 0,
      maxUsage: data.maxUsage,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    },
  })
  revalidatePath("/admin/general-coupons")
}

export async function updateAdminCoupon(
  id: string,
  data: {
    code?: string
    title?: string
    description?: string
    couponType?: string
    discountType?: string
    discountValue?: number
    discountPercent?: number
    category?: string
    allowedServices?: string[]
    isPublic?: boolean
    isActive?: boolean
    minimumAmount?: number
    maxUsage?: number
    expiryDate?: string
  }
) {
  await requireAdmin()
  const { expiryDate, ...rest } = data
  const updateData: any = { ...rest }
  if (expiryDate !== undefined) {
    updateData.expiryDate = expiryDate ? new Date(expiryDate) : null
  }
  if (data.code) {
    updateData.code = data.code.toUpperCase()
  }
  if (data.discountType === "percentage" && data.discountValue !== undefined) {
    updateData.discountPercent = Math.round(data.discountValue)
  }
  await prisma.couponCode.update({ where: { id }, data: updateData })
  revalidatePath("/admin/general-coupons")
}

export async function deleteAdminCoupon(id: string) {
  await requireAdmin()
  await prisma.couponCode.delete({ where: { id } })
  revalidatePath("/admin/general-coupons")
}

export async function getAdminCoupon(id: string) {
  await requireAdmin()
  return prisma.couponCode.findUnique({
    where: { id },
    include: {
      usage: { include: { coupon: true }, orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { usage: true, userCoupons: true } },
    },
  })
}

export async function getCouponAnalytics() {
  await requireAdmin()
  const [topCoupons, dailyUsage, totalDiscountGiven] = await Promise.all([
    prisma.couponUsage.groupBy({
      by: ["couponId"],
      _count: true,
      _sum: { discountAmount: true },
      orderBy: { _count: { couponId: "desc" } },
      take: 20,
    }),
    prisma.couponUsage.groupBy({
      by: ["createdAt"],
      _count: true,
      _sum: { discountAmount: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.couponUsage.aggregate({ _sum: { discountAmount: true } }),
  ])

  const couponDetails = await prisma.couponCode.findMany({
    where: { id: { in: topCoupons.map((c) => c.couponId) } },
    select: { id: true, code: true, title: true },
  })

  const couponMap = new Map(couponDetails.map((c) => [c.id, c]))

  return {
    topCoupons: topCoupons.map((c) => ({
      couponId: c.couponId,
      code: couponMap.get(c.couponId)?.code || "Unknown",
      title: couponMap.get(c.couponId)?.title || "Unknown",
      uses: c._count,
      totalDiscount: c._sum.discountAmount ?? 0,
    })),
    totalDiscountGiven: totalDiscountGiven._sum.discountAmount ?? 0,
  }
}

// ── Admin: Legacy Coupon/Spin management (backward compat) ──

export async function getCouponCodes() {
  await requireAdmin()
  const userCoupons = await prisma.userCoupon.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true, mobile: true } },
      coupon: { select: { id: true, title: true, discountPercent: true, discountValue: true, discountType: true, category: true, code: true } },
    },
    orderBy: { assignedAt: "desc" },
  })

  return userCoupons.map((uc) => ({
    id: uc.id,
    user: uc.user,
    couponCode: uc.code,
    reward: uc.coupon.title,
    discountPercent: uc.coupon.discountPercent ?? Math.round(uc.coupon.discountValue),
    category: uc.coupon.category,
    status: uc.isRedeemed ? "redeemed" : "active",
    offer: uc.coupon,
    createdAt: uc.assignedAt,
  }))
}

export async function getGeneralCouponCodes() {
  await requireAdmin()
  return prisma.couponCode.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createGeneralCouponCode(data: {
  code: string
  description?: string
  discountPercent: number
  type: string
  category?: string
  maxUses: number
  expiryDate?: string
}) {
  await requireAdmin()
  const existing = await prisma.couponCode.findUnique({ where: { code: data.code } })
  if (existing) {
    throw new Error("A coupon code with this name already exists")
  }
  await prisma.couponCode.create({
    data: {
      code: data.code.toUpperCase(),
      title: data.description || `${data.discountPercent}% Off`,
      description: data.description,
      couponType: data.type === "referral" ? "referral" : "public",
      discountType: "percentage",
      discountValue: data.discountPercent,
      discountPercent: data.discountPercent,
      category: data.category || null,
      isPublic: true,
      maxUsage: data.maxUses,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    },
  })
  revalidatePath("/admin/general-coupons")
}

export async function updateGeneralCouponCode(
  id: string,
  data: {
    code?: string
    description?: string
    discountPercent?: number
    type?: string
    category?: string
    maxUses?: number
    isActive?: boolean
    expiryDate?: string
  }
) {
  await requireAdmin()
  const { expiryDate, ...rest } = data
  const updateData: any = { ...rest }
  if (expiryDate !== undefined) {
    updateData.expiryDate = expiryDate ? new Date(expiryDate) : null
  }
  if (data.code) {
    updateData.code = data.code.toUpperCase()
  }
  if (data.category !== undefined) {
    updateData.category = data.category || null
  }
  if (data.discountPercent !== undefined) {
    updateData.discountValue = data.discountPercent
  }
  await prisma.couponCode.update({ where: { id }, data: updateData })
  revalidatePath("/admin/general-coupons")
}

export async function deleteGeneralCouponCode(id: string) {
  await requireAdmin()
  await prisma.couponCode.delete({ where: { id } })
  revalidatePath("/admin/general-coupons")
}

// ── Admin: Spin Offers ──

export async function getSpinOffers() {
  await requireAdmin()
  return prisma.spinOffer.findMany({ orderBy: { probability: "desc" } })
}

export async function createSpinOffer(data: {
  title: string
  description?: string
  probability: number
  rewardType: string
  couponCode?: string
  image?: string
  color?: string
  category?: string
  discountType?: string
  discountValue?: number
  expiryDate?: string
}) {
  await requireAdmin()
  await prisma.spinOffer.create({
    data: {
      title: data.title,
      description: data.description,
      probability: data.probability,
      rewardType: data.rewardType,
      couponCode: data.couponCode,
      image: data.image,
      color: data.color,
      category: data.category || null,
      discountType: data.discountType || "percentage",
      discountValue: data.discountValue || 0,
      discountPercent: data.discountType === "percentage" ? Math.round(data.discountValue || 0) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    },
  })
  revalidatePath("/admin/offers")
}

export async function updateSpinOffer(
  id: string,
  data: {
    title?: string
    description?: string
    probability?: number
    rewardType?: string
    couponCode?: string
    image?: string
    isActive?: boolean
    color?: string
    category?: string
    discountType?: string
    discountValue?: number
    expiryDate?: string
  }
) {
  await requireAdmin()
  const { expiryDate, ...rest } = data
  const updateData: any = { ...rest }
  if (expiryDate) {
    updateData.expiryDate = new Date(expiryDate)
  }
  if (data.category !== undefined) {
    updateData.category = data.category || null
  }
  if (data.discountType === "percentage" && data.discountValue !== undefined) {
    updateData.discountPercent = Math.round(data.discountValue)
  }
  await prisma.spinOffer.update({ where: { id }, data: updateData })
  revalidatePath("/admin/offers")
}

export async function deleteSpinOffer(id: string) {
  await requireAdmin()
  await prisma.spinOffer.delete({ where: { id } })
  revalidatePath("/admin/offers")
}

// ── Admin: Spin Analytics ──

export async function getSpinAnalytics() {
  await requireAdmin()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalSpins,
    totalUsers,
    redeemedCoupons,
    history,
    totalRegisteredUsers,
    todayUsage,
    sessions,
    activeUsers,
  ] = await Promise.all([
    prisma.spinHistory.count(),
    prisma.spinHistory.groupBy({ by: ["userId"] }),
    prisma.spinHistory.count({ where: { status: "redeemed" } }),
    prisma.spinHistory.findMany({
      include: { offer: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.dailySpinUsage.aggregate({
      _sum: { spinsUsed: true },
      where: { date: today },
    }),
    prisma.userSession.aggregate({
      _avg: { activeDuration: true },
      where: { sessionEnd: { not: null } },
    }),
    prisma.user.findMany({
      where: { totalTimeSpent: { gt: 0 } },
      orderBy: { totalTimeSpent: "desc" },
      take: 5,
      select: { id: true, fullName: true, totalTimeSpent: true, email: true },
    }),
  ])

  const rewardDistribution = await prisma.spinHistory.groupBy({
    by: ["reward"],
    _count: true,
    orderBy: { _count: { reward: "desc" } },
  })

  const totalCouponSpins = await prisma.spinHistory.count({
    where: { NOT: { couponCode: null }, status: { not: "skipped" } },
  })

  const couponRedemptionRate =
    totalCouponSpins > 0
      ? Math.round((redeemedCoupons / totalCouponSpins) * 100)
      : 0

  const dailyUsage7 = await prisma.dailySpinUsage.groupBy({
    by: ["date"],
    _sum: { spinsUsed: true },
    where: {
      date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { date: "asc" },
  })

  return {
    totalSpins,
    uniqueUsers: totalUsers.length,
    redeemedCoupons,
    rewardDistribution: rewardDistribution.map((r) => ({
      reward: r.reward,
      count: r._count,
    })),
    recentSpins: history,
    totalRegisteredUsers,
    spinsToday: todayUsage._sum.spinsUsed ?? 0,
    avgSessionSeconds: Math.round(sessions._avg.activeDuration ?? 0),
    couponRedemptionRate,
    dailyUsage7: dailyUsage7.map((d) => ({
      date: d.date.toISOString().slice(0, 10),
      spins: d._sum.spinsUsed ?? 0,
    })),
    mostActiveUsers: activeUsers.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      totalTimeSpent: u.totalTimeSpent,
    })),
  }
}

// ── Events ──

export async function getActiveEvents() {
  const events = await prisma.event.findMany({
    where: { isActive: true, endDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  })
  const bookings = await prisma.eventBooking.groupBy({
    by: ["eventId"],
    _count: true,
  })
  const countMap = Object.fromEntries(bookings.map((b) => [b.eventId, b._count]))
  return events.map((e) => ({ ...e, bookingCount: countMap[e.id] || 0 }))
}

export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  })
  if (!event) return null
  return { ...event, bookingCount: event._count.bookings }
}

export async function getEvents() {
  await requireAdmin()
  return prisma.event.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { startDate: "desc" },
  })
}

export async function createEvent(data: {
  title: string
  description?: string
  image?: string
  startDate: string
  endDate: string
  capacity: number
  price: number
  category?: string
}) {
  await requireAdmin()
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      image: data.image,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      capacity: data.capacity,
      price: data.price,
      category: data.category || null,
    },
  })
  revalidatePath("/admin/events")
  return event
}

export async function updateEvent(
  id: string,
  data: {
    title?: string
    description?: string
    image?: string
    startDate?: string
    endDate?: string
    capacity?: number
    price?: number
    category?: string
    isActive?: boolean
  }
) {
  await requireAdmin()
  const { startDate, endDate, ...rest } = data
  const updateData: any = { ...rest }
  if (startDate) updateData.startDate = new Date(startDate)
  if (endDate) updateData.endDate = new Date(endDate)
  await prisma.event.update({ where: { id }, data: updateData })
  revalidatePath("/admin/events")
}

export async function deleteEvent(id: string) {
  await requireAdmin()
  await prisma.event.delete({ where: { id } })
  revalidatePath("/admin/events")
}

export async function bookEvent(data: {
  eventId: string
  customerName: string
  customerEmail: string
  customerPhone: string
}) {
  const session = await auth()
  const event = await prisma.event.findUnique({
    where: { id: data.eventId },
    include: { _count: { select: { bookings: true } } },
  })
  if (!event || !event.isActive) throw new Error("Event not found")
  if (event.endDate < new Date()) throw new Error("Event has ended")
  if (event.capacity > 0 && event._count.bookings >= event.capacity) {
    throw new Error("Event is fully booked")
  }

  const booking = await prisma.eventBooking.create({
    data: {
      eventId: data.eventId,
      userId: session?.user?.id || "",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
    },
  })

  await prisma.notification.create({
    data: {
      role: "admin",
      title: "New Event Booking",
      message: `${data.customerName} booked for "${event.title}"`,
      link: "/admin/events",
      type: "booking",
    },
  })

  revalidatePath("/events")
  return booking
}

export async function getUserEventBookings() {
  const session = await auth()
  if (!session?.user?.id) return []
  return prisma.eventBooking.findMany({
    where: { userId: session.user.id },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getEventBookings(eventId: string) {
  await requireAdmin()
  return prisma.eventBooking.findMany({
    where: { eventId },
    include: { user: { select: { fullName: true, email: true, mobile: true } } },
    orderBy: { createdAt: "desc" },
  })
}

// ── Notifications ──

export async function getNotifications(role?: string) {
  const session = await auth()
  if (role === "admin") {
    await requireAdmin()
    return prisma.notification.findMany({
      where: { role: "admin" },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  }
  if (!session?.user?.id) return []
  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getUnreadNotificationCount(role?: string) {
  const session = await auth()
  if (role === "admin") {
    await requireAdmin()
    return prisma.notification.count({ where: { role: "admin", isRead: false } })
  }
  if (!session?.user?.id) return 0
  return prisma.notification.count({ where: { userId: session.user.id, isRead: false } })
}

export async function markNotificationRead(id: string) {
  await prisma.notification.update({ where: { id }, data: { isRead: true } })
}

export async function markAllNotificationsRead(role?: string) {
  const session = await auth()
  if (role === "admin") {
    await requireAdmin()
    await prisma.notification.updateMany({
      where: { role: "admin", isRead: false },
      data: { isRead: true },
    })
    return
  }
  if (!session?.user?.id) return
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })
}

export async function createNotification(data: {
  userId?: string
  role?: string
  title: string
  message: string
  type?: string
  link?: string
}) {
  await prisma.notification.create({ data })
}
