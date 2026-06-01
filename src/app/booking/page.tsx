"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { format, addDays, startOfToday } from "date-fns"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createBooking, getServices, getStylists } from "@/lib/actions"
import { formatPrice, generateTimeSlots } from "@/lib/utils"
import type { Service, Stylist } from "@prisma/client"
import type { BookingFormData } from "@/types"

type Step = "service" | "stylist" | "datetime" | "info" | "confirm"

const steps: { key: Step; label: string }[] = [
  { key: "service", label: "Services" },
  { key: "stylist", label: "Stylist" },
  { key: "datetime", label: "Date & Time" },
  { key: "info", label: "Your Info" },
  { key: "confirm", label: "Confirm" },
]

const categories = ["all", "hair", "skincare", "nails", "massage"]

function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedServiceId = searchParams.get("serviceId")

  const [currentStep, setCurrentStep] = useState<Step>("service")
  const [services, setServices] = useState<Service[]>([])
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")

  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceIds: preselectedServiceId ? [preselectedServiceId] : [],
    stylistId: "",
    date: format(addDays(startOfToday(), 1), "yyyy-MM-dd"),
    time: "",
    notes: "",
  })

  useEffect(() => {
    async function load() {
      const [svc, styl] = await Promise.all([getServices(), getStylists()])
      setServices(svc)
      setStylists(styl)
      setLoading(false)
    }
    load()
  }, [])

  const filteredServices = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory)

  const selectedServices = services.filter((s) => formData.serviceIds.includes(s.id))
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const selectedStylist = stylists.find((s) => s.id === formData.stylistId)

  const toggleService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((sid) => sid !== id)
        : [...prev.serviceIds, id],
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case "service":
        return formData.serviceIds.length > 0
      case "stylist":
        return !!formData.stylistId
      case "datetime":
        return !!formData.date && !!formData.time
      case "info":
        return !!formData.customerName && !!formData.customerEmail && !!formData.customerPhone
      default:
        return true
    }
  }

  const stepIndex = steps.findIndex((s) => s.key === currentStep)

  const goNext = () => {
    if (stepIndex < steps.length - 1) setCurrentStep(steps[stepIndex + 1].key)
  }

  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(steps[stepIndex - 1].key)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const booking = await createBooking(formData)
      router.push(`/booking/confirmation/${booking.id}`)
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Image src="/pblogo.png" alt="PB Logo" width={56} height={56} className="rounded-2xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
            Schedule Your Visit
          </h1>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  i <= stepIndex
                    ? "bg-luxury-gold text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`ml-2 text-xs font-medium hidden sm:block ${
                  i <= stepIndex ? "text-luxury-gold" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 ${
                    i < stepIndex ? "bg-luxury-gold" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            {currentStep === "service" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-semibold">
                    Select Services
                  </h2>
                  {selectedServices.length > 0 && (
                    <span className="text-sm text-luxury-gold font-medium">
                      {selectedServices.length} selected &middot;{" "}
                      {formatPrice(totalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        activeCategory === cat
                          ? "bg-luxury-gold text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredServices.map((svc) => {
                    const selected = formData.serviceIds.includes(svc.id)
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          selected
                            ? "border-luxury-gold bg-luxury-gold/5 ring-2 ring-luxury-gold/20"
                            : "border-gray-200 hover:border-luxury-gold/40"
                        }`}
                      >
                        {svc.image && (
                          <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100">
                            <img
                              src={svc.image}
                              alt={svc.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-medium text-sm leading-tight">{svc.name}</h3>
                        <p className="text-luxury-gold font-semibold text-sm mt-1">
                          {formatPrice(svc.price)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[11px] text-gray-400">{svc.duration} min</span>
                          <span className="text-[11px] text-gray-300 capitalize">&middot; {svc.category}</span>
                        </div>
                        {selected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-luxury-gold rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {currentStep === "stylist" && (
              <div className="space-y-4">
                <h2 className="text-xl font-display font-semibold mb-4">
                  Choose a Stylist
                </h2>
                <div className="grid gap-3">
                  {stylists.map((styl) => (
                    <button
                      key={styl.id}
                      onClick={() => {
                        setFormData({ ...formData, stylistId: styl.id })
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        formData.stylistId === styl.id
                          ? "border-luxury-gold bg-luxury-gold/5"
                          : "border-gray-200 hover:border-luxury-gold/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {styl.image && (
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0">
                            <img
                              src={styl.image}
                              alt={styl.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{styl.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{styl.bio}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === "datetime" && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-semibold mb-4">
                  Select Date & Time
                </h2>
                <div>
                  <Input
                    id="date"
                    type="date"
                    label="Date"
                    value={formData.date}
                    min={format(addDays(startOfToday(), 1), "yyyy-MM-dd")}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value, time: "" })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                    Time
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {generateTimeSlots().map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, time: t })}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                          formData.time === t
                            ? "border-luxury-gold bg-luxury-gold/10 text-luxury-gold"
                            : "border-gray-200 text-gray-600 hover:border-luxury-gold/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === "info" && (
              <div className="space-y-4">
                <h2 className="text-xl font-display font-semibold mb-4">
                  Your Information
                </h2>
                <Input
                  id="name"
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                />
                <Input
                  id="phone"
                  label="Phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
                <Textarea
                  id="notes"
                  label="Special Requests (optional)"
                  placeholder="Any preferences or requests..."
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            )}

            {currentStep === "confirm" && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-semibold mb-4">
                  Confirm Your Booking
                </h2>
                <div className="bg-luxury-cream rounded-xl p-6 space-y-4">
                  <div>
                    <span className="text-gray-500 text-sm block mb-2">Services</span>
                    <div className="space-y-2">
                      {selectedServices.map((svc) => (
                        <div key={svc.id} className="flex justify-between items-center">
                          <span className="font-medium">{svc.name}</span>
                          <span className="text-sm text-luxury-gold">
                            {formatPrice(svc.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-300 mt-3 pt-3 flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold text-luxury-gold text-lg">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stylist</span>
                    <span className="font-medium">{selectedStylist?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">
                      {format(new Date(formData.date), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">{formData.time}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium">{formData.customerName}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium">{formData.customerEmail}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium">{formData.customerPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={currentStep === "service"}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              {currentStep === "confirm" ? (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Booking..." : "Confirm Booking"}
                </Button>
              ) : (
                <Button onClick={goNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  )
}
