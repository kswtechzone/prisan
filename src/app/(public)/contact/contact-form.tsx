"use client"

import { useState, useRef } from "react"
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitContactForm } from "@/lib/actions"

export function ContactForm() {
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const ref = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const result = await submitContactForm({
      name: form.get("name") as string,
      phone: form.get("phone") as string,
      email: form.get("email") as string,
      message: form.get("message") as string,
    })
    setSending(false)
    if (result.success) {
      setDone(true)
      ref.current?.reset()
    } else {
      setError(result.error || "Something went wrong.")
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">Message Sent!</h3>
        <p className="text-sm text-green-600">
          Thank you for reaching out. We&apos;ll get back to you shortly.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setDone(false)}
        >
          Send Another
        </Button>
      </div>
    )
  }

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        name="name"
        label="Name"
        placeholder="Your name"
        required
      />
      <Input
        id="phone"
        name="phone"
        label="Contact Number"
        type="tel"
        placeholder="Your phone number"
        required
      />
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="Your email address"
        required
      />
      <Textarea
        id="message"
        name="message"
        label="Message"
        placeholder="How can we help you?"
        rows={5}
        required
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={sending} className="w-full">
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
