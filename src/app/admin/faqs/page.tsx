"use client"

import { useState, useEffect } from "react"
import { HelpCircle, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Spinner } from "@/components/ui/spinner"
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/lib/actions"
import type { Faq } from "@prisma/client"

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [form, setForm] = useState({ question: "", answer: "", category: "general", order: 0 })

  const load = async () => {
    setLoading(true)
    setFaqs(await getFaqs())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ question: "", answer: "", category: "general", order: 0 })
    setShowModal(true)
  }

  const openEdit = (faq: Faq) => {
    setEditing(faq)
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (editing) {
      await updateFaq(editing.id, form)
    } else {
      await createFaq(form)
    }
    setShowModal(false)
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return
    await deleteFaq(id)
    await load()
  }

  const handleToggle = async (faq: Faq) => {
    await updateFaq(faq.id, { active: !faq.active })
    await load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">FAQs</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardContent className="p-4 flex items-start gap-4">
              <HelpCircle className="w-5 h-5 text-luxury-gold mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{faq.question}</h3>
                  <Badge className="text-[10px] capitalize">{faq.category}</Badge>
                  <span className="text-xs text-gray-400">#{faq.order}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(faq)}
                  className={`p-1.5 rounded text-xs font-medium transition-colors ${
                    faq.active
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {faq.active ? "Active" : "Hidden"}
                </button>
                <button onClick={() => openEdit(faq)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(faq.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {faqs.length === 0 && (
          <p className="text-center text-gray-400 py-16">No FAQs yet. Click &quot;Add FAQ&quot; to create one.</p>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit FAQ" : "Add FAQ"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[100px]"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.question || !form.answer}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
