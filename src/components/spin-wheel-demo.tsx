"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, Sparkles } from "lucide-react"

interface DemoOffer {
  title: string
  color: string | null
  rewardType?: string | null
}

export function SpinWheelDemo({ offers }: { offers: DemoOffer[] }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)

  const segments = offers.filter((o) => o.rewardType !== "none").slice(0, 8)

  if (segments.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="relative cursor-pointer group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => router.push("/spin")}
      >
        <div
          className={`w-64 h-64 md:w-72 md:h-72 rounded-full shadow-2xl relative transition-transform duration-500 ${
            hovered ? "scale-105" : "scale-100"
          }`}
          style={{
            background: `conic-gradient(${segments
              .map((seg, i) => {
                const start = (i / segments.length) * 100
                const end = ((i + 1) / segments.length) * 100
                return `${seg.color || "#8B5E3C"} ${start}% ${end}%`
              })
              .join(", ")})`,
          }}
        >
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center z-10">
            <div className="text-center">
              <Gift className="w-8 h-8 text-luxury-gold mx-auto mb-1" />
              <span className="text-xs font-semibold text-luxury-charcoal">
                SPIN
              </span>
            </div>
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-luxury-rose drop-shadow-lg" />
          </div>
        </div>

        <div
          className={`absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-all duration-300 z-30 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
            <span className="text-white text-lg font-bold">Play Now</span>
          </div>
        </div>
      </div>
    </div>
  )
}
