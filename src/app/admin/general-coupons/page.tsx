"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { Spinner } from "@/components/ui/spinner"
import {
  getGeneralCouponCodes,
  createGeneralCouponCode,
  updateGeneralCouponCode,
  deleteGeneralCouponCode,
} from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Ticket, Copy, Check } from "lucide-react"

interface GeneralCoupon {
  id: string
  code: string
  description: string | null
  discountPercent: number
  type: string
  category: string | null
  maxUses: number
  usedCount: number
  isActive: boolean
  expiryDate: string | null
  createdAt: string
}

const categories = ["", "hair", "nails", "skincare", "makeup", "massage"]

const defaultForm = {
  code: "",
  description: "",
  discountPercent: 0,
  type: "general",
  category: "",
  maxUses: 0,
  expiryDate: "",
}

export default function AdminGeneralCouponsPage() {
  const [coupons, setCoupons] = useState<GeneralCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<GeneralCoupon | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadCoupons()
  }, [])

  async function loadCoupons() {
    try {
      const data = await getGeneralCouponCodes()
      setCoupons(data as unknown as GeneralCoupon[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function openEdit(coupon: GeneralCoupon) {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountPercent: coupon.discountPercent,
      type: coupon.type,
      category: coupon.category || "",
      maxUses: coupon.maxUses,
      expiryDate: coupon.expiryDate
        ? new Date(coupon.expiryDate).toISOString().split("T")[0]
        : "",
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        await updateGeneralCouponCode(editing.id, form)
      } else {
        await createGeneralCouponCode(form)
      }
      setModalOpen(false)
      await loadCoupons()
    } catch (e: any) {
      alert(e.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(coupon: GeneralCoupon) {
    await updateGeneralCouponCode(coupon.id, { isActive: !coupon.isActive })
    await loadCoupons()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon code?")) return
    await deleteGeneralCouponCode(id)
    await loadCoupons()
  }

  async function handleCopy(code: string, id: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // silently fail
    }
  }

  if (loading) return <Spinner className="mx-auto mt-12" />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            General Coupons
          </h1>
          <p className="text-gray-500 text-sm">
            Create and manage coupon codes usable by all customers
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Uses</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Active</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm">{c.code}</span>
                        <button
                          onClick={() => handleCopy(c.code, c.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy code"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                      {c.description || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">{c.discountPercent}%</span>
                    </td>
                    <td className="py-3 px-4">
                      {c.category ? (
                        <span className="capitalize text-gray-600">{c.category}</span>
                      ) : (
                        <span className="text-gray-400">All</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={c.type === "referral" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                        {c.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className={c.maxUses > 0 && c.usedCount >= c.maxUses ? "text-red-500 font-medium" : ""}>
                        {c.usedCount}{c.maxUses > 0 ? ` / ${c.maxUses}` : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.isActive}
                          onChange={() => handleToggle(c)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-gray-400">
                      <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <div className="text-lg mb-1">No general coupons yet</div>
                      <div className="text-sm">
                        Create coupon codes that any customer can apply during booking.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Coupon Code" : "New Coupon Code"}
      >
        <div className="space-y-4">
          <Input
            label="Coupon Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. WELCOME20"
            required
          />
          <Textarea
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What this coupon is for..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount (%)"
              type="number"
              value={form.discountPercent}
              onChange={(e) =>
                setForm({ ...form, discountPercent: Number(e.target.value) })
              }
              min={0}
              max={100}
              required
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: "general", label: "General" },
                { value: "referral", label: "Referral" },
              ]}
            />
          </div>
          <Select
            label="Category (optional — restricts discount to this category)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: "", label: "All Categories" },
              { value: "hair", label: "Hair" },
              { value: "nails", label: "Nails" },
              { value: "skincare", label: "Skincare" },
              { value: "makeup", label: "Makeup" },
              { value: "massage", label: "Massage" },
            ]}
          />
          <Input
            label="Max Uses (0 = unlimited)"
            type="number"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
            min={0}
          />
          <Input
            label="Expiry Date (optional)"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={saving || !form.code || form.discountPercent <= 0}
          >
            {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
