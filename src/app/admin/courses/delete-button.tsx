"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteCourse } from "@/lib/actions"

export function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await deleteCourse(id)
      router.refresh()
    } catch {
      alert("Failed to delete course")
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete course"
    >
      <Trash2 className="w-4 h-4 text-red-400" />
    </button>
  )
}
