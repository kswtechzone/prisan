"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteGalleryImage } from "@/lib/actions"

export function DeleteGalleryButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteGalleryImage(id)
      router.refresh()
    } catch {
      alert("Failed to delete image.")
    } finally {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="danger" onClick={handleDelete} disabled={loading} className="text-xs px-2 py-1">
          {loading ? "..." : "Yes"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} className="text-xs px-2 py-1 bg-white/90">
          No
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setConfirming(true)}
      className="text-red-500 hover:text-red-700 bg-white/80 hover:bg-white p-1.5"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
