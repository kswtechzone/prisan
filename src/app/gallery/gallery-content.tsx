"use client"

import { useState } from "react"
import Image from "next/image"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GalleryImage } from "@prisma/client"

export function GalleryContent({
  images,
  categories,
}: {
  images: GalleryImage[]
  categories: { value: string; label: string }[]
}) {
  const [activeTab, setActiveTab] = useState("all")
  const [selected, setSelected] = useState<GalleryImage | null>(null)

  const filtered =
    activeTab === "all"
      ? images
      : images.filter((img) => img.category === activeTab)

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-gold/10 text-luxury-gold text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Our Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-luxury-charcoal mb-4">
            Beauty Gallery
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our work across every service category.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveTab(cat.value)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                activeTab === cat.value
                  ? "bg-luxury-gold text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-luxury-gold hover:text-luxury-gold"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No images in this category yet.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelected(img)}
                className="break-inside-avoid w-full group relative overflow-hidden rounded-2xl"
              >
                <Image
                  src={img.url}
                  alt={img.caption || "Gallery image"}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {img.caption && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium">{img.caption}</p>
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 text-xs font-medium rounded-full capitalize text-luxury-charcoal">
                  {img.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selected.url}
              alt={selected.caption || "Gallery image"}
              width={1200}
              height={800}
              className="w-full h-auto rounded-2xl"
            />
            {selected.caption && (
              <p className="text-white text-center mt-4 text-lg font-medium">
                {selected.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
