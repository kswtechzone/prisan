import { Suspense } from "react"
import { AdminLoginForm } from "./login-form"

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury-cream flex items-center justify-center p-4"><p className="text-gray-500">Loading...</p></div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
