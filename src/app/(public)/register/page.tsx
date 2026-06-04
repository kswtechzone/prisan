"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { registerUser } from "@/lib/actions"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const confirm = form.get("confirmPassword") as string

    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await registerUser({
      fullName: form.get("fullName") as string,
      email: form.get("email") as string,
      mobile: form.get("mobile") as string,
      address: form.get("address") as string,
      password,
    })

    if ("error" in result) {
      setError(result.error!)
      setLoading(false)
    } else {
      router.push("/profile")
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/prisanbeautylogo.png"
              alt="PB Logo"
              width={56}
              height={56}
              className="rounded-2xl"
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join Prisan Beauty and start winning rewards
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="fullName"
                name="fullName"
                label="Full Name"
                placeholder="Your full name"
                required
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                label="Mobile Number"
                placeholder="98XXXXXXXX"
                required
              />
              <Input
                id="address"
                name="address"
                label="Address"
                placeholder="Your address in Kathmandu"
              />
              <PasswordInput
                id="password"
                name="password"
                label="Password"
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-luxury-gold hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
