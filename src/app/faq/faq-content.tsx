"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Faq } from "@prisma/client"

export function FaqContent({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(null)

  const categories = [...new Set(faqs.map((f) => f.category))]
  const [activeCat, setActiveCat] = useState(categories[0] || "general")

  const filtered = activeCat ? faqs.filter((f) => f.category === activeCat) : faqs

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCat(cat); setOpen(null) }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCat === cat
                  ? "bg-luxury-gold text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((faq) => {
          const isOpen = open === faq.id
          return (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                onClick={() => setOpen(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
