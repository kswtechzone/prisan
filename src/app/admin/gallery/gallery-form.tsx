"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload, X, ImageIcon, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { createGalleryImagesBatch } from "@/lib/actions"
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
  const [category, setCategory] = useState(image?.category || "hair")
  const [caption, setCaption] = useState(image?.caption || "")
  const [pending, setPending] = useState<{ file: File; preview: string; url?: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef<string[]>([])

  const reset = () => {
    previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    previewUrlsRef.current = []
    setPending([])
    setCategory("hair")
    setCaption("")
  }

  useEffect(() => {
    return () => previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const allUploaded = pending.length > 0 && pending.every((p) => p.url)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    const newItems = selected.map((file) => {
      const preview = URL.createObjectURL(file)
      previewUrlsRef.current.push(preview)
      return { file, preview }
    })
    setPending((prev) => [...prev, ...newItems])
    if (e.target) e.target.value = ""

    newItems.forEach((item) => {
      const fd = new FormData()
      fd.append("dir", "gallery")
      fd.append("file", item.file)
      fetch("/api/upload", { method: "POST", body: fd })
        .then((res) => res.json())
        .then((data) => {
          if (data.urls?.[0]) {
            setPending((prev) =>
              prev.map((p) => (p.preview === item.preview ? { ...p, url: data.urls[0] } : p))
            )
          }
        })
        .catch(() => {})
    })
  }

  const removeItem = (idx: number) => {
    URL.revokeObjectURL(pending[idx].preview)
    previewUrlsRef.current.splice(idx, 1)
    setPending((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!allUploaded) return
    setLoading(true)
    try {
      await createGalleryImagesBatch({
        urls: pending.map((p) => p.url!),
        caption: caption || undefined,
        category,
      })
      setOpen(false)
      reset()
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
        <Plus className="w-4 h-4 mr-1" />
        Add Images
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Gallery Images" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {pending.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {pending.map((item, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <Image src={item.preview} alt="" fill unoptimized className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-center py-1">
                    {item.url ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-luxury-gold transition-colors flex flex-col items-center justify-center bg-gray-50"
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 hover:border-luxury-gold transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50"
            >
              <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
              <span className="text-sm text-gray-500 font-medium">Click to select images</span>
              <span className="text-xs text-gray-400 mt-1">Supports multiple selection</span>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleSelect}
            className="hidden"
          />

          <Input
            id="caption"
            label="Caption (shared for all)"
            placeholder="Optional caption for all selected images"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <Select
            id="category"
            name="category"
            label="Category"
            options={categories}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Select category"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); setOpen(false) }}>Cancel</Button>
            <Button type="submit" disabled={loading || !allUploaded}>
              {loading
                ? "Saving..."
                : !allUploaded && pending.length > 0
                  ? "Uploading..."
                  : `Add ${pending.length} image${pending.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
