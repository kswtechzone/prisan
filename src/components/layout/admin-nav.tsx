"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, CalendarDays, Scissors, Users, Image as ImageIcon, HelpCircle, Search, FileText, Gift, TrendingUp, LogOut, Ticket, Percent, Settings, PartyPopper, SlidersHorizontal, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/lib/actions"

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/stylists", label: "Stylists", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/offers", label: "Offers", icon: Gift },
  { href: "/admin/spin-settings", label: "Spin Settings", icon: SlidersHorizontal },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/general-coupons", label: "General Coupons", icon: Percent },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/events", label: "Events", icon: PartyPopper },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction()
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-luxury-charcoal text-white p-6 hidden md:flex flex-col">
      <Link href="/admin" className="flex items-center gap-3 mb-8">
        <Image src="/prisanbeautylogo.png" alt="PB Logo" width={32} height={32} className="rounded-lg" unoptimized />
        <span className="font-display text-lg">Admin Panel</span>
      </Link>

      <nav className="space-y-1 flex-1">
        {adminLinks.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-luxury-gold text-luxury-charcoal"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 pt-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          &larr; Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
