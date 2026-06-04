"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell } from "lucide-react"
import { getUnreadNotificationCount, getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/actions"
import { formatDistanceToNow } from "date-fns"

interface Props {
  role?: "admin" | "customer"
}

export function NotificationBell({ role }: Props) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const playSound = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = "sine"
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [])

  const load = useCallback(async () => {
    try {
      const [notifCount, notifs] = await Promise.all([
        getUnreadNotificationCount(role),
        getNotifications(role),
      ])
      if (notifCount > count) playSound()
      setCount(notifCount)
      setNotifications(notifs)
    } catch {}
  }, [role, count, playSound])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  async function handleMarkRead(id: string) {
    await markNotificationRead(id)
    setCount((c) => Math.max(0, c - 1))
    setNotifications((n) => n.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  async function handleMarkAll() {
    await markAllNotificationsRead(role)
    setCount(0)
    setNotifications((n) => n.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 sticky top-0 bg-white">
              <span className="text-sm font-semibold text-gray-700">Notifications</span>
              {count > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-luxury-gold hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No notifications</div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <a
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => { if (!n.isRead) handleMarkRead(n.id) }}
                  className={`block p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-luxury-gold/5" : ""}`}
                >
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </a>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
