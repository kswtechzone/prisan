"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Download, X, Users, Mail, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCourseBookings } from "@/lib/actions"
import { format } from "date-fns"

interface Props {
  courseId: string
  courseTitle: string
  enrollmentCount: number
}

export function EnrollmentsModal({ courseId, courseTitle, enrollmentCount }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function openModal() {
    setOpen(true)
    setLoading(true)
    try {
      const data = await getCourseBookings(courseId)
      setBookings(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function exportToExcel() {
    const rows = bookings.map((b, i) => ({
      "#": i + 1,
      Name: b.customerName,
      Email: b.customerEmail,
      Phone: b.customerPhone,
      Status: b.status,
      "Enrolled At": format(new Date(b.createdAt), "MMM d, yyyy h:mm a"),
    }))

    import("xlsx").then((XLSX) => {
      const ws = XLSX.utils.json_to_sheet(rows)
      const colWidths = [
        { wch: 4 },
        { wch: 25 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
      ]
      ws["!cols"] = colWidths
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Enrollments")
      const safeName = courseTitle.replace(/[^a-zA-Z0-9]/g, "_")
      XLSX.writeFile(wb, `${safeName}_enrollments.xlsx`)
    })
  }

  return (
    <>
      <button
        onClick={openModal}
        className="p-2 hover:bg-luxury-gold/10 rounded-lg transition-colors"
        title="View enrollments"
      >
        <Eye className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="text-xl font-semibold text-luxury-charcoal flex items-center gap-2">
                  <Users className="w-5 h-5 text-luxury-gold" />
                  {courseTitle}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{enrollmentCount} enrollment{enrollmentCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={exportToExcel} disabled={bookings.length === 0}>
                  <Download className="w-4 h-4 mr-1.5" /> Export
                </Button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">No enrollments yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.map((b, i) => (
                    <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <span className="text-xs text-gray-400 font-mono w-6 shrink-0 text-right">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-luxury-charcoal">{b.customerName}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {b.customerEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {b.customerPhone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(b.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
