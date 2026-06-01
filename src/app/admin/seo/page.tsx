"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { getAllSeoMeta, upsertSeoMeta, getSeoMeta } from "@/lib/actions"

const pages = [
  { key: "home", label: "Home" },
  { key: "services", label: "Services" },
  { key: "gallery", label: "Gallery" },
  { key: "booking", label: "Booking" },
  { key: "faq", label: "FAQ" },
]

export default function AdminSeoPage() {
  const [activePage, setActivePage] = useState("home")
  const [meta, setMeta] = useState<{
    title: string
    description: string
    keywords: string
    ogImage: string
    schemaJson: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async (page: string) => {
    setLoading(true)
    setActivePage(page)
    const data = await getSeoMeta(page)
    setMeta(
      data
        ? { title: data.title || "", description: data.description || "", keywords: data.keywords || "", ogImage: data.ogImage || "", schemaJson: data.schemaJson || "" }
        : { title: "", description: "", keywords: "", ogImage: "", schemaJson: "" }
    )
    setLoading(false)
  }

  useEffect(() => { load("home") }, [])

  const handleSave = async () => {
    if (!meta) return
    setSaving(true)
    await upsertSeoMeta({ page: activePage, ...meta })
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">SEO &amp; Meta Tags</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {pages.map((p) => (
          <button
            key={p.key}
            onClick={() => load(p.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activePage === p.key ? "bg-luxury-gold text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Input
              label="Meta Title"
              placeholder="Prisan Beauty — Premium Salon in Kathmandu"
              value={meta?.title || ""}
              onChange={(e) => setMeta((m) => (m ? { ...m, title: e.target.value } : null))}
            />
            <Input
              label="Meta Description"
              placeholder="Book premium beauty services in Kathmandu..."
              value={meta?.description || ""}
              onChange={(e) => setMeta((m) => (m ? { ...m, description: e.target.value } : null))}
            />
            <Input
              label="Meta Keywords"
              placeholder="beauty salon, Kathmandu, hair, skincare"
              value={meta?.keywords || ""}
              onChange={(e) => setMeta((m) => (m ? { ...m, keywords: e.target.value } : null))}
            />
            <Input
              label="OG Image URL"
              placeholder="/prisanbeautylogo.png"
              value={meta?.ogImage || ""}
              onChange={(e) => setMeta((m) => (m ? { ...m, ogImage: e.target.value } : null))}
            />
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Schema.org JSON-LD
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono min-h-[200px]"
                placeholder='{"@context":"https://schema.org",...}'
                value={meta?.schemaJson || ""}
                onChange={(e) => setMeta((m) => (m ? { ...m, schemaJson: e.target.value } : null))}
              />
              <p className="text-xs text-gray-400 mt-1">
                Paste raw JSON-LD structured data. Will be injected as a &lt;script&gt; tag on the page.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Meta Tags"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
