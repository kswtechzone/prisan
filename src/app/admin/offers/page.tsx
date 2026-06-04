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
  getSpinOffers,
  createSpinOffer,
  updateSpinOffer,
  deleteSpinOffer,
} from "@/lib/actions"
import { Plus, Pencil, Trash2, Gift } from "lucide-react"

interface SpinOffer {
  id: string
  title: string
  description: string | null
  probability: number
  rewardType: string
  couponCode: string | null
  image: string | null
  isActive: boolean
  color: string | null
  category: string | null
  expiryDate: string | null
}

const categories = ["", "hair", "nails", "skincare", "makeup", "massage"]

const defaultForm = {
  title: "",
  description: "",
  probability: 0,
  rewardType: "discount",
  couponCode: "",
  color: "#8B5E3C",
  category: "",
  expiryDate: "",
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<SpinOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SpinOffer | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOffers()
  }, [])

  async function loadOffers() {
    try {
      const data = await getSpinOffers()
      setOffers(data as unknown as SpinOffer[])
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

  function openEdit(offer: SpinOffer) {
    setEditing(offer)
    setForm({
      title: offer.title,
      description: offer.description || "",
      probability: offer.probability,
      rewardType: offer.rewardType,
      couponCode: offer.couponCode || "",
      color: offer.color || "#8B5E3C",
      category: offer.category || "",
      expiryDate: offer.expiryDate
        ? new Date(offer.expiryDate).toISOString().split("T")[0]
        : "",
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        await updateSpinOffer(editing.id, form)
      } else {
        await createSpinOffer(form)
      }
      setModalOpen(false)
      await loadOffers()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(offer: SpinOffer) {
    await updateSpinOffer(offer.id, { isActive: !offer.isActive })
    await loadOffers()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this offer?")) return
    await deleteSpinOffer(id)
    await loadOffers()
  }

  if (loading) return <Spinner className="mx-auto mt-12" />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            Spin Offers
          </h1>
          <p className="text-gray-500 text-sm">
            Manage spin wheel rewards and probabilities
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <Card
            key={offer.id}
            className={`${!offer.isActive ? "opacity-60" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: (offer.color || "#8B5E3C") + "20",
                    }}
                  >
                    <Gift
                      className="w-5 h-5"
                      style={{ color: offer.color || "#8B5E3C" }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{offer.title}</p>
                    <p className="text-xs text-gray-500">
                      {offer.probability}% &middot; {offer.rewardType}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offer.isActive}
                    onChange={() => handleToggle(offer)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-luxury-gold peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>

              {offer.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {offer.description}
                </p>
              )}

              {offer.couponCode && (
                <p className="text-xs font-mono bg-gray-100 inline-block px-2 py-1 rounded mb-3">
                  {offer.couponCode}
                </p>
              )}

              {offer.expiryDate && (
                <p className="text-xs text-gray-400">
                  Expires:{" "}
                  {new Date(offer.expiryDate).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openEdit(offer)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Offer" : "New Offer"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 5% Off Nail Art"
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Offer description..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Probability (%)"
              type="number"
              value={form.probability}
              onChange={(e) =>
                setForm({ ...form, probability: Number(e.target.value) })
              }
              min={0}
              max={100}
              required
            />
            <Select
              label="Reward Type"
              value={form.rewardType}
              onChange={(e) =>
                setForm({ ...form, rewardType: e.target.value })
              }
              options={[
                { value: "discount", label: "Discount" },
                { value: "free_service", label: "Free Service" },
                { value: "coupon", label: "Coupon" },
                { value: "cashback", label: "Cashback" },
                { value: "gift", label: "Gift" },
                { value: "none", label: "No Reward" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Coupon Code (optional)"
              value={form.couponCode}
              onChange={(e) =>
                setForm({ ...form, couponCode: e.target.value })
              }
              placeholder="e.g. NAIL5"
            />
            <Input
              label="Color"
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <Select
            label="Category (optional — restricts discount to this service category)"
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
            label="Expiry Date (optional)"
            type="date"
            value={form.expiryDate}
            onChange={(e) =>
              setForm({ ...form, expiryDate: e.target.value })
            }
          />
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={saving || !form.title || form.probability <= 0}
          >
            {saving ? "Saving..." : editing ? "Update Offer" : "Create Offer"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
