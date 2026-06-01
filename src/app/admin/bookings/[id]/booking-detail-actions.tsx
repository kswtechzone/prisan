"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { updateBookingStatus } from "@/lib/actions"

export function BookingDetailActions({
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

  return (
    <div className="flex gap-2">
      {status === "pending" && (
        <Button onClick={() => handleStatus("confirmed")}>
          Confirm Booking
        </Button>
      )}
      {status === "confirmed" && (
        <Button onClick={() => handleStatus("completed")}>
          Mark Completed
        </Button>
      )}
      {(status === "pending" || status === "confirmed") && (
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleStatus("cancelled")}
        >
          Cancel Booking
        </Button>
      )}
    </div>
  )
}
