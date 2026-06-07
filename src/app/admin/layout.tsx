import { AdminNav } from "@/components/layout/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <div className="flex-1 bg-gray-50 min-h-screen overflow-auto pb-16 md:pb-0">
        <div className="p-4 md:p-8">{children}</div>
        <MobileNav />
      </div>
    </div>
  )
}

function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 flex items-center justify-around shadow-lg">
      <MobileLink href="/admin" label="Home" icon="LayoutDashboard" />
      <MobileLink href="/admin/bookings" label="Bookings" icon="CalendarDays" />
      <MobileLink href="/admin/offers" label="Offers" icon="Gift" />
      <MobileLink href="/admin/analytics" label="Analytics" icon="TrendingUp" />
      <MobileLink href="/admin/spin-settings" label="Spin" icon="SlidersHorizontal" />
    </div>
  )
}

function MobileLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] text-gray-500 hover:text-luxury-gold transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icon === "LayoutDashboard" && <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>}
        {icon === "CalendarDays" && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
        {icon === "Gift" && <><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>}
        {icon === "TrendingUp" && <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>}
        {icon === "Scissors" && <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></>}
        {icon === "SlidersHorizontal" && <><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="12" x2="14" y2="12" /><line x1="18" y1="16" x2="22" y2="16" /></>}
      </svg>
      <span>{label}</span>
    </a>
  )
}
