export interface BookingFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceIds: string[]
  stylistId: string
  date: string
  time: string
  notes?: string
  couponCode?: string
}

export interface BookingSlot {
  time: string
  available: boolean
}

export interface CouponValidationResult {
  valid: boolean
  message?: string
  discountType?: "percentage" | "fixed" | "full_service"
  discountValue?: number
  discountPercent?: number
  reward?: string
  category?: string | null
  couponId?: string
  userCouponId?: string
  couponCode?: string
  title?: string
  allowedServices?: string[]
  minimumAmount?: number
}

export interface InvoiceLineItem {
  serviceId: string
  serviceName: string
  category: string
  originalPrice: number
  discountedPrice: number
  discountAmount: number
  isDiscounted: boolean
}

export interface Invoice {
  subtotal: number
  lineItems: InvoiceLineItem[]
  totalDiscount: number
  finalAmount: number
  couponCode?: string
  couponTitle?: string
  discountPercent?: number
}

export interface CourseBookingFormData {
  courseId: string
  customerName: string
  customerEmail: string
  customerPhone: string
}
