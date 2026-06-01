"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, DollarSign, ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils"
import type { Service } from "@prisma/client"

export function ServicesContent({
  services,
  categories,
}: {
  services: Service[]
  categories: { value: string; label: string }[]
}) {
  const [activeTab, setActiveTab] = useState("all")

  const filtered =
    activeTab === "all"
      ? services
      : services.filter((s) => s.category === activeTab)

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-gold/10 text-luxury-gold text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Our Services
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-luxury-charcoal mb-4">
            Premium Beauty Services
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Indulge in our curated selection of beauty treatments designed to
            enhance your natural beauty.
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
            No services in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
              >
                {service.image ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-luxury-cream to-luxury-champagne flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-luxury-gold/40" />
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="mb-1">
                    <span className="text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-luxury-gold transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-luxury-gold">
                      {formatPrice(service.price)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {service.duration} min
                    </span>
                  </div>
                  <Link href={`/services/${service.id}`}>
                    <Button variant="outline" size="sm" className="w-full group/btn">
                      View Details
                      <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
