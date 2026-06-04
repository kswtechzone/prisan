"use client"

import { useEffect, useRef } from "react"
import { updateUserActivity, startSession, endSession } from "@/lib/actions"

export function UserActivityTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true
      startSession().catch(() => {})
    }

    const handleVisibility = () => {
      if (document.hidden) {
        endSession().catch(() => {})
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        startSession().catch(() => {})
        intervalRef.current = setInterval(() => {
          updateUserActivity(30).catch(() => {})
        }, 30000)
      }
    }

    const handleBeforeUnload = () => {
      endSession().catch(() => {})
    }

    intervalRef.current = setInterval(() => {
      updateUserActivity(30).catch(() => {})
    }, 30000)

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      endSession().catch(() => {})
    }
  }, [])

  return null
}
