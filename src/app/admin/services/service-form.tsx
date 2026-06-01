"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { createService, updateService } from "@/lib/actions"
import type { Service } from "@prisma/client"

const categories = [
  { value: "hair", label: "Hair" },
  { value: "nails", label: "Nails" },
  { value: "skincare", label: "Skincare" },
  { value: "makeup", label: "Makeup" },
  { value: "massage", label: "Massage" },
]

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(service?.image || "")
  const fileRef = useRef<HTMLInputElement>(null)
  const isEdit = !!service

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      const url = data.url || data.urls?.[0]
      if (url) setImageUrl(url)
    } catch {
      alert("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const data = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      price: parseFloat(form.get("price") as string),
      duration: parseInt(form.get("duration") as string),
      category: form.get("category") as string,
      image: imageUrl || undefined,
    }

    try {
      if (isEdit) {
        await updateService(service.id, {
          ...data,
          active: form.get("active") === "on",
        })
      } else {
        await createService(data)
      }
      setOpen(false)
      router.refresh()
    } catch {
      alert("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {isEdit ? (
          <Pencil className="w-4 h-4" />
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" />
            Add Service
          </>
        )}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Edit Service" : "Add Service"}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Service Name"
            defaultValue={service?.name}
            required
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            defaultValue={service?.description}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price"
              name="price"
              label="Price ($)"
              type="number"
              step="0.01"
              defaultValue={service?.price}
              required
            />
            <Input
              id="duration"
              name="duration"
              label="Duration (min)"
              type="number"
              defaultValue={service?.duration}
              required
            />
          </div>
          <Select
            id="category"
            name="category"
            label="Category"
            options={categories}
            defaultValue={service?.category}
            placeholder="Select category"
          />

          <div>
            <label className="block text-sm font-medium text-luxury-charcoal mb-2">
              Image
            </label>
            <input
              type="hidden"
              name="image"
              value={imageUrl}
            />
            {imageUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 mb-2">
                <Image
                  src={imageUrl}
                  alt="Service image"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 hover:border-luxury-gold transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  {uploading ? "Uploading..." : "Click to upload image"}
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={service?.active}
              />
              Active
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
