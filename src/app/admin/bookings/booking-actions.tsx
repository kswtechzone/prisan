"use client"

import { Button } from "@/components/ui/button"
import { updateBookingStatus } from "@/lib/actions"
import { useRouter } from "next/navigation"

export function BookingActions({
  id,
  status,
}: {
  id: string
  status: string
}) {
  const router = useRouter()

  const handleStatus = async (newStatus: string) => {
    await updateBookingStatus(id, newStatus)
    router.refresh()
  }

  if (status === "cancelled" || status === "completed") return null

  return (
    <div className="flex gap-2">
      {status === "pending" && (
        <Button
          size="sm"
          onClick={() => handleStatus("confirmed")}
        >
          Confirm
        </Button>
      )}
      {status === "confirmed" && (
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleStatus("completed")}
        >
          Complete
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => handleStatus("cancelled")}
      >
        Cancel
      </Button>
    </div>
  )
}
