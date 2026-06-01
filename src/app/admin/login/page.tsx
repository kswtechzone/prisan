"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/lib/actions"

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const result = await loginAction(
      form.get("email") as string,
      form.get("password") as string
    )

    if ("error" in result) {
      setError((result as { error: string }).error)
      setLoading(false)
    } else {
      router.push("/admin")
    }
  }

  return (
    <div className="min-h-screen bg-luxury-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/pblogo.png" alt="PB Logo" width={56} height={56} className="rounded-2xl" />
          </div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Prisan Beauty Management
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="admin@prisanbeauty.com"
                required
                autoComplete="email"
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
