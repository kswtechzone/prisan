"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useCallback, useRef, useEffect } from "react"

const statusTabs = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export function BookingsFilter({
  currentStatus,
  currentQuery,
  counts,
}: {
  currentStatus: string
  currentQuery: string
  counts: Record<string, number>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(currentQuery)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParams = useCallback(
    (status: string, q: string) => {
      const params = new URLSearchParams()
      if (status && status !== "all") params.set("status", status)
      if (q) params.set("q", q)
      const qs = params.toString()
      router.push(qs ? `/admin/bookings?${qs}` : "/admin/bookings")
    },
    [router]
  )

  const handleSearch = (value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateParams(currentStatus, value)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateParams(tab.value, query)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              currentStatus === tab.value
                ? "bg-luxury-gold text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={cn(
                  "ml-1.5 text-xs",
                  currentStatus === tab.value
                    ? "text-white/80"
                    : "text-gray-400"
                )}
              >
                ({counts[tab.value]})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, service..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
        />
      </div>
    </div>
  )
}
