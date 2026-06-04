"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, Sparkles, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/ui/notification-bell"
import { cn } from "@/lib/utils"

interface NavUser {
  id: string
  name: string
  email: string
  role: string
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/spin", label: "Spin & Win", icon: Sparkles },
  { href: "/rewards", label: "Rewards" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

export function Navbar({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-luxury-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/prisanbeautylogo.png"
              alt="PB Logo"
              width={36}
              height={36}
              className="rounded-lg"
              unoptimized
            />
            <span className="text-xl font-display font-semibold text-luxury-charcoal">
              Prisan Beauty
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  link.href === "/spin"
                    ? "text-luxury-gold hover:text-luxury-gold/80 flex items-center gap-1"
                    : "text-gray-600 hover:text-luxury-gold"
                )}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5 inline mr-0.5" />}
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <NotificationBell />
                <div className="relative group">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    {user.name.split(" ")[0]}
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link href="/profile/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Bookings</Link>
                  </div>
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

            <Link href="/booking">
              <Button variant={user ? "primary" : "outline"} size="sm">
                Book Now
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-luxury-cream bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium",
                  link.href === "/spin"
                    ? "text-luxury-gold bg-luxury-gold/5"
                    : "text-gray-600 hover:text-luxury-gold hover:bg-luxury-cream"
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-luxury-gold hover:bg-luxury-cream"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-luxury-gold hover:bg-luxury-cream"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
            )}

            <Link href="/booking" onClick={() => setOpen(false)}>
              <Button className="w-full" size="sm">
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
