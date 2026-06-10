"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { bookCourse } from "@/lib/actions"
import { CheckCircle } from "lucide-react"

interface Props {
  courseId: string
  customerName: string
  customerEmail: string
  disabled?: boolean
}

export function CourseBookingForm({ courseId, customerName, customerEmail, disabled }: Props) {
  const [phone, setPhone] = useState("")
  const [booking, setBooking] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!phone.trim()) return setError("Phone number is required")
    setBooking(true)
    setError("")
    try {
      await bookCourse({
        courseId,
        customerName,
        customerEmail,
        customerPhone: phone,
      })
      setDone(true)
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setBooking(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium py-2.5">
        <CheckCircle className="w-5 h-5" />
        Enrolled successfully!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        type="tel"
        placeholder="Your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold"
        disabled={disabled}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button onClick={handleSubmit} disabled={booking || disabled} className="w-full">
        {booking ? "Enrolling..." : disabled ? "Fully Booked" : "Enroll Now"}
      </Button>
    </div>
  )
}
