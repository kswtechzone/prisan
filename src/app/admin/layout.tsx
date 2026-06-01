import { AdminNav } from "@/components/layout/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto">
        {children}
      </div>
    </div>
  )
}
