"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Check, Search, CalendarDays, Clock, User as UserIcon, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { getServices, getStylists, createBooking } from "@/lib/actions"
import { formatPrice, generateTimeSlots } from "@/lib/utils"
import { format, addDays, startOfToday } from "date-fns"
import type { Service, Stylist } from "@prisma/client"

type CartItem = Service

export function WalkinBooking() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<"items" | "details">("items")

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [stylistId, setStylistId] = useState("")
  const [date, setDate] = useState(format(addDays(startOfToday(), 0), "yyyy-MM-dd"))
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!open) return
    async function load() {
      setLoading(true)
      const [svc, styl] = await Promise.all([getServices(), getStylists()])
      setServices(svc)
      setStylists(styl)
      setLoading(false)
    }
    load()
  }, [open])

  const reset = () => {
    setCart([])
    setStep("items")
    setCustomerName("")
    setCustomerEmail("")
    setCustomerPhone("")
    setStylistId("")
    setDate(format(addDays(startOfToday(), 0), "yyyy-MM-dd"))
    setTime("")
    setNotes("")
    setCategory("all")
    setSearch("")
  }

  const categories = ["all", ...new Set(services.map((s) => s.category))]

  const filtered = services.filter((s) => {
    if (category !== "all" && s.category !== category) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return s.active
  })

  const addToCart = (service: Service) => {
    setCart((prev) => {
      if (prev.find((s) => s.id === service.id)) return prev
      return [...prev, service]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((s) => s.id !== id))
  }

  const totalPrice = cart.reduce((sum, s) => sum + s.price, 0)

  const handleSubmit = async () => {
    if (!stylistId || !time || !customerName || cart.length === 0) return
    setSubmitting(true)
    try {
      await createBooking({
        customerName,
        customerEmail: customerEmail || "walkin@prisanbeauty.com",
        customerPhone,
        serviceIds: cart.map((s) => s.id),
        stylistId,
        date,
        time,
        notes: notes || undefined,
      })
      setOpen(false)
      reset()
      router.refresh()
    } catch {
      alert("Failed to create booking")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button size="lg" onClick={() => { reset(); setOpen(true) }}>
        <Plus className="w-5 h-5 mr-2" />
        New Walk-in Booking
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="New Walk-in Booking" className="max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-0 -m-6">
          <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-luxury-gold text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filtered.map((svc) => {
                  const inCart = cart.find((s) => s.id === svc.id)
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => inCart ? removeFromCart(svc.id) : addToCart(svc)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${
                        inCart
                          ? "border-luxury-gold bg-luxury-gold/5"
                          : "border-gray-200 hover:border-luxury-gold/40"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{svc.name}</p>
                        <p className="text-xs text-gray-400">{svc.duration} min</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-sm font-semibold text-luxury-gold">
                          {formatPrice(svc.price)}
                        </span>
                        {inCart ? (
                          <div className="w-5 h-5 bg-luxury-gold rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="w-full lg:w-80 p-6 flex flex-col max-h-[70vh]">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-4 h-4 text-luxury-gold" />
              <h3 className="font-semibold text-sm">Cart</h3>
              <span className="text-xs text-gray-400 ml-auto">{cart.length} items</span>
            </div>

            <div className="flex-1 space-y-2 min-h-0 overflow-y-auto mb-4">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Select services from the left</p>
              ) : (
                cart.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{svc.name}</p>
                      <p className="text-[11px] text-gray-400">{svc.duration} min</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs font-semibold text-luxury-gold">{formatPrice(svc.price)}</span>
                      <button onClick={() => removeFromCart(svc.id)} className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-3">
              {step === "details" && (
                <div className="space-y-3 mb-3">
                  <Input
                    id="wc-name"
                    label="Full Name *"
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="wc-email"
                      label="Email"
                      type="email"
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                    <Input
                      id="wc-phone"
                      label="Phone *"
                      type="tel"
                      placeholder="Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-luxury-charcoal mb-1.5">Stylist *</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {stylists.filter((s) => s.active).map((styl) => (
                        <button
                          key={styl.id}
                          type="button"
                          onClick={() => setStylistId(styl.id)}
                          className={`text-left px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            stylistId === styl.id
                              ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                              : "border-gray-200 text-gray-600 hover:border-luxury-gold/40"
                          }`}
                        >
                          {styl.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-luxury-charcoal mb-1">Date</label>
                      <input
                        type="date"
                        value={date}
                        min={format(addDays(startOfToday(), 0), "yyyy-MM-dd")}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-luxury-charcoal mb-1">Time *</label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                      >
                        <option value="">Select</option>
                        {generateTimeSlots().map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Textarea
                    id="wc-notes"
                    label="Notes"
                    placeholder="Optional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold text-luxury-gold">{formatPrice(totalPrice)}</span>
              </div>

              <div className="flex gap-2">
                {step === "details" ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setStep("items")} className="flex-1">
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={submitting || !customerName || !stylistId || !time || cart.length === 0}
                      className="flex-1"
                    >
                      {submitting ? "Creating..." : "Confirm Booking"}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setStep("details")}
                    disabled={cart.length === 0}
                    className="w-full"
                  >
                    Continue — {formatPrice(totalPrice)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
