"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface Props {
  id: string
  name: string
  label: string
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
}

export function PasswordInput({ id, name, label, placeholder, required, minLength, autoComplete }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-luxury-charcoal">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
