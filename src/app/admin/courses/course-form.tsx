"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { createCourse, updateCourse } from "@/lib/actions"
import type { Course } from "@prisma/client"

export function CourseForm({ course }: { course?: Course }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(course?.image || "")
  const fileRef = useRef<HTMLInputElement>(null)
  const isEdit = !!course

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append("dir", "courses")
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
    setSaving(true)
    const form = new FormData(e.currentTarget)

    const data = {
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      image: imageUrl || undefined,
      price: parseFloat(form.get("price") as string) || 0,
      duration: (form.get("duration") as string) || undefined,
      startDate: (form.get("startDate") as string) || undefined,
      endDate: (form.get("endDate") as string) || undefined,
      capacity: parseInt(form.get("capacity") as string) || 0,
      category: (form.get("category") as string) || undefined,
    }

    try {
      if (isEdit) {
        await updateCourse(course.id, {
          ...data,
          isActive: form.get("isActive") === "on",
        })
      } else {
        await createCourse(data)
      }
      setOpen(false)
      router.refresh()
    } catch (e) {
      alert("Something went wrong.")
    } finally {
      setSaving(false)
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
            Add Course
          </>
        )}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Edit Course" : "Add Course"}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            name="title"
            label="Course Title"
            defaultValue={course?.title}
            placeholder="e.g. Professional Makeup Course"
            required
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            defaultValue={course?.description || ""}
            placeholder="Course description..."
          />
          <Input
            id="duration"
            name="duration"
            label="Duration"
            defaultValue={course?.duration || ""}
            placeholder="e.g. 2 hours, 4 weeks, Full day"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startDate"
              name="startDate"
              label="Start Date"
              type="date"
              defaultValue={course?.startDate?.toISOString().slice(0, 10) || ""}
            />
            <Input
              id="endDate"
              name="endDate"
              label="End Date"
              type="date"
              defaultValue={course?.endDate?.toISOString().slice(0, 10) || ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price"
              name="price"
              label="Price (Rs.)"
              type="number"
              min="0"
              defaultValue={course?.price || 0}
            />
            <Input
              id="capacity"
              name="capacity"
              label="Capacity (0 = unlimited)"
              type="number"
              min="0"
              defaultValue={course?.capacity || 0}
            />
          </div>
          <Input
            id="category"
            name="category"
            label="Category"
            defaultValue={course?.category || ""}
            placeholder="e.g. makeup, skincare"
          />
          <div>
            <label className="block text-sm font-medium text-luxury-charcoal mb-2">
              Image
            </label>
            <input type="hidden" name="image" value={imageUrl} />
            {imageUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 mb-2">
                <Image
                  src={imageUrl}
                  alt="Course image"
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
              <input type="checkbox" name="isActive" defaultChecked={course?.isActive} />
              Active
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
