"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Calendar, Eye, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { Spinner } from "@/components/ui/spinner"
import { getEvents, createEvent, updateEvent, deleteEvent, getEventBookings } from "@/lib/actions"
import { format } from "date-fns"

interface EventForm {
  title: string
  description: string
  image: string
  startDate: string
  endDate: string
  capacity: number
  price: number
  category: string
}

const defaultForm: EventForm = {
  title: "",
  description: "",
  image: "",
  startDate: "",
  endDate: "",
  capacity: 0,
  price: 0,
  category: "",
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<EventForm>(defaultForm)
  const [saving, setSaving] = useState(false)

  const [bookingsOpen, setBookingsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  function openEdit(event: any) {
    setEditing(event)
    setForm({
      title: event.title,
      description: event.description || "",
      image: event.image || "",
      startDate: event.startDate.slice(0, 10),
      endDate: event.endDate.slice(0, 10),
      capacity: event.capacity,
      price: event.price,
      category: event.category || "",
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        await updateEvent(editing.id, form)
      } else {
        await createEvent(form)
      }
      setModalOpen(false)
      await loadEvents()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(event: any) {
    await updateEvent(event.id, { isActive: !event.isActive })
    await loadEvents()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return
    await deleteEvent(id)
    await loadEvents()
  }

  async function openBookings(event: any) {
    setSelectedEvent(event)
    setBookingsOpen(true)
    setBookingsLoading(true)
    try {
      const data = await getEventBookings(event.id)
      setBookings(data)
    } catch (e) {
      console.error(e)
    } finally {
      setBookingsLoading(false)
    }
  }

  function exportToExcel() {
    const rows = bookings.map((b, i) => ({
      "#": i + 1,
      Name: b.customerName,
      Email: b.customerEmail,
      Phone: b.customerPhone,
      Status: b.status,
      "Booked At": format(new Date(b.createdAt), "MMM d, yyyy h:mm a"),
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
      XLSX.utils.book_append_sheet(wb, ws, "Bookings")
      const safeName = (selectedEvent?.title || "event").replace(/[^a-zA-Z0-9]/g, "_")
      XLSX.writeFile(wb, `${safeName}_bookings.xlsx`)
    })
  }

  if (loading) return <Spinner className="mx-auto mt-12" />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">Events</h1>
          <p className="text-gray-500 text-sm">Manage special events like free nail sessions, promotions, etc.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id} className={!event.isActive ? "opacity-60" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-luxury-gold/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {event._count?.bookings || 0} bookings &middot; {event.capacity > 0 ? `cap: ${event.capacity}` : "no limit"}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={event.isActive} onChange={() => handleToggle(event)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-luxury-gold peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
              )}

              <div className="text-xs text-gray-400 space-y-1">
                <p>{format(new Date(event.startDate), "MMM d, yyyy")} — {format(new Date(event.endDate), "MMM d, yyyy")}</p>
                {event.price > 0 && <p className="text-luxury-gold font-medium">Rs. {event.price}</p>}
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(event)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
                <button onClick={() => openBookings(event)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto">
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No events yet. Create your first event!</div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Event" : "New Event"}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Free Nail Session" required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event description..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity (0 = unlimited)" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} min={0} />
            <Input label="Price (Rs.)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} min={0} />
          </div>
          <Input label="Category (optional)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. nails, hair" />
          <Input label="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          <Button onClick={handleSave} className="w-full" disabled={saving || !form.title || !form.startDate || !form.endDate}>
            {saving ? "Saving..." : editing ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </Modal>

      {/* Bookings Modal */}
      {bookingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBookingsOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="text-xl font-semibold text-luxury-charcoal">
                  {selectedEvent?.title} — Bookings
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={exportToExcel} disabled={bookings.length === 0}>
                  <Download className="w-4 h-4 mr-1.5" /> Export
                </Button>
                <button onClick={() => setBookingsOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {bookingsLoading ? (
                <Spinner className="mx-auto mt-8" />
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No bookings yet.</div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b, i) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-gray-400 font-mono w-6 shrink-0">{i + 1}.</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-luxury-charcoal truncate">{b.customerName}</p>
                          <p className="text-xs text-gray-500">{b.customerEmail} {b.customerPhone ? `· ${b.customerPhone}` : ""}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-xs text-gray-400">{format(new Date(b.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
