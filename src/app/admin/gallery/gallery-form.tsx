"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Upload, X, ImageIcon } from "lucide-react"
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
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFiles([])
    setPreviews([])
    setUploadedUrls([])
    setCategory("hair")
    setCaption("")
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    setFiles((prev) => [...prev, ...selected])
    selected.forEach((f) => {
      const url = URL.createObjectURL(f)
      setPreviews((prev) => [...prev, url])
    })
    if (e.target) e.target.value = ""
  }

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setFiles((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
    setUploadedUrls((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return
    setUploading(true)
    const fd = new FormData()
    fd.append("dir", "gallery")
    files.forEach((f) => fd.append("file", f))
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.urls) setUploadedUrls(data.urls)
    } catch {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }, [files])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const urls = uploadedUrls.length > 0 ? uploadedUrls : previews
    try {
      if (urls.length > 0) {
        await createGalleryImagesBatch({ urls, caption: caption || undefined, category })
      }
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
          {previews.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <Image src={url} alt="" fill unoptimized className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {uploadedUrls[i] && (
                    <div className="absolute bottom-0 inset-x-0 bg-green-500 text-white text-[10px] text-center py-0.5 font-medium">
                      Uploaded
                    </div>
                  )}
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

          {files.length > 0 && uploadedUrls.length !== files.length && (
            <Button type="button" variant="outline" onClick={handleUpload} disabled={uploading} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? `Uploading ${files.length - uploadedUrls.length} left...` : `Upload ${files.length} images`}
            </Button>
          )}

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
            <Button type="submit" disabled={loading || files.length === 0}>
              {loading ? "Saving..." : `Add ${files.length} image${files.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
