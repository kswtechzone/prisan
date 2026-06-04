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

export interface CouponInfo {
  id: string
  code: string
  title: string
  discountType: "percentage" | "fixed" | "full_service"
  discountValue: number
  discountPercent?: number | null
  category?: string | null
  allowedServices: string[]
  minimumAmount: number
}

export function calculateInvoice(
  services: { id: string; name: string; price: number; category: string }[],
  coupon: CouponInfo | null,
): Invoice {
  const subtotal = services.reduce((sum, s) => sum + s.price, 0)

  if (!coupon) {
    return {
      subtotal,
      lineItems: services.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        category: s.category,
        originalPrice: s.price,
        discountedPrice: s.price,
        discountAmount: 0,
        isDiscounted: false,
      })),
      totalDiscount: 0,
      finalAmount: subtotal,
    }
  }

  // Check minimum amount
  if (coupon.minimumAmount > 0 && subtotal < coupon.minimumAmount) {
    return {
      subtotal,
      lineItems: services.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        category: s.category,
        originalPrice: s.price,
        discountedPrice: s.price,
        discountAmount: 0,
        isDiscounted: false,
      })),
      totalDiscount: 0,
      finalAmount: subtotal,
      couponCode: coupon.code,
      couponTitle: coupon.title,
    }
  }

  // Determine which services are eligible
  const hasCategoryRestriction = !!coupon.category
  const hasServiceRestriction = coupon.allowedServices.length > 0

  const lineItems: InvoiceLineItem[] = services.map((s) => {
    const isEligible =
      (!hasCategoryRestriction || s.category === coupon.category) &&
      (!hasServiceRestriction || coupon.allowedServices.includes(s.id))

    let discountedPrice = s.price
    let discountAmount = 0

    if (isEligible) {
      if (coupon.discountType === "percentage") {
        const pct = coupon.discountPercent ?? coupon.discountValue ?? 0
        discountAmount = Math.round((s.price * pct) / 100)
        discountedPrice = s.price - discountAmount
      } else if (coupon.discountType === "fixed") {
        // For fixed discount, total is calculated across all eligible services
        // Per-item fixed split is handled at invoice level
        discountAmount = 0 // calculated at invoice level
        discountedPrice = s.price
      } else if (coupon.discountType === "full_service") {
        discountAmount = s.price
        discountedPrice = 0
      }
    }

    return {
      serviceId: s.id,
      serviceName: s.name,
      category: s.category,
      originalPrice: s.price,
      discountedPrice,
      discountAmount,
      isDiscounted: isEligible && (coupon.discountType !== "fixed"),
    }
  })

  let totalDiscount: number

  if (coupon.discountType === "fixed") {
    // Fixed discount: apply across all eligible services proportionally
    const eligibleServices = lineItems.filter(
      (li) =>
        (!coupon.category || li.category === coupon.category) &&
        (!hasServiceRestriction || coupon.allowedServices.includes(li.serviceId)),
    )
    const eligibleTotal = eligibleServices.reduce((sum, li) => sum + li.originalPrice, 0)
    const fixedDiscount = Math.min(coupon.discountValue, eligibleTotal)

    if (eligibleTotal > 0) {
      let remainingDiscount = fixedDiscount
      for (const li of eligibleServices) {
        const proportion = li.originalPrice / eligibleTotal
        const itemDiscount = Math.round(proportion * fixedDiscount)
        li.discountAmount = Math.min(itemDiscount, remainingDiscount, li.originalPrice)
        li.discountedPrice = li.originalPrice - li.discountAmount
        li.isDiscounted = li.discountAmount > 0
        remainingDiscount -= li.discountAmount
      }
      // Distribute any leftover pennies to the first eligible service
      if (remainingDiscount > 0 && eligibleServices.length > 0) {
        const first = eligibleServices[0]
        const actualDeduction = Math.min(remainingDiscount, first.discountedPrice)
        first.discountAmount += actualDeduction
        first.discountedPrice = first.originalPrice - first.discountAmount
      }
    }
    totalDiscount = fixedDiscount
  } else if (coupon.discountType === "full_service") {
    // Full service reward: one service is free
    // Only the first eligible full-service item gets it
    totalDiscount = lineItems.reduce((sum, li) => sum + li.discountAmount, 0)
  } else {
    // Percentage
    totalDiscount = lineItems.reduce((sum, li) => sum + li.discountAmount, 0)
  }

  // Prevent negative totals
  const finalAmount = Math.max(0, subtotal - totalDiscount)

  return {
    subtotal,
    lineItems,
    totalDiscount,
    finalAmount,
    couponCode: coupon.code,
    couponTitle: coupon.title,
    discountPercent: coupon.discountPercent ?? undefined,
  }
}

export function formatInvoice(invoice: Invoice): string {
  const lines = [`Subtotal: Rs.${invoice.subtotal}`]
  if (invoice.totalDiscount > 0) {
    lines.push(`Discount Applied:`)
    invoice.lineItems
      .filter((li) => li.isDiscounted)
      .forEach((li) => {
        lines.push(`  ${li.serviceName}: -Rs.${li.discountAmount}`)
      })
    lines.push(`Total Discount: -Rs.${invoice.totalDiscount}`)
  }
  lines.push(`Final Total: Rs.${invoice.finalAmount}`)
  return lines.join("\n")
}
