"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload, X, Pencil } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { createGalleryImage } from "@/lib/actions"
import type { GalleryImage } from "@prisma/client"

const categories = [
  { value: "hair", label: "Hair" },
  { value: "nails", label: "Nails" },
  { value: "skincare", label: "Skincare" },
  { value: "makeup", label: "Makeup" },
  { value: "massage", label: "Massage" },
]

export function GalleryForm({ image }: { image?: GalleryImage }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(image?.url || "")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) setImageUrl(data.url)
    } catch {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const data = {
      url: imageUrl,
      caption: (form.get("caption") as string) || undefined,
      category: form.get("category") as string,
    }

    try {
      await createGalleryImage(data)
      setOpen(false)
      setImageUrl("")
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
        {image ? <Pencil className="w-4 h-4" /> : <>
          <Plus className="w-4 h-4 mr-1" />
          Add Image
        </>}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Gallery Image">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="url" value={imageUrl} />
          {imageUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
              <Image src={imageUrl} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 hover:border-luxury-gold transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {uploading ? "Uploading..." : "Click to upload image"}
              </span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <Input id="caption" name="caption" label="Caption (optional)" defaultValue={image?.caption || ""} />
          <Select
            id="category"
            name="category"
            label="Category"
            options={categories}
            defaultValue={image?.category}
            placeholder="Select category"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || uploading || !imageUrl}>
              {loading ? "Saving..." : "Add"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
