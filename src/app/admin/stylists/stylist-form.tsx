"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { createStylist, updateStylist } from "@/lib/actions"
import type { Stylist } from "@prisma/client"

export function StylistForm({ stylist }: { stylist?: Stylist }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isEdit = !!stylist

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const data = {
      name: form.get("name") as string,
      bio: form.get("bio") as string,
      image: (form.get("image") as string) || undefined,
    }

    try {
      if (isEdit) {
        await updateStylist(stylist.id, {
          ...data,
          active: form.get("active") === "on",
        })
      } else {
        await createStylist(data)
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
            Add Stylist
          </>
        )}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Edit Stylist" : "Add Stylist"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Name"
            defaultValue={stylist?.name}
            required
          />
          <Textarea
            id="bio"
            name="bio"
            label="Bio"
            defaultValue={stylist?.bio}
            required
          />
          <Input
            id="image"
            name="image"
            label="Image URL (optional)"
            defaultValue={stylist?.image || ""}
          />
          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={stylist?.active}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
