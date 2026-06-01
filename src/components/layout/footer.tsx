import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-luxury-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/prisanbeautylogo.png" alt="PB Logo" width={36} height={36} className="rounded-lg" unoptimized />
              <span className="text-xl font-display font-semibold">
                Prisan Beauty
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Where elegance meets expertise. Experience premium beauty and
              wellness services tailored to you.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-gray-400 hover:text-luxury-gold transition-colors">
                Home
              </Link>
              <Link href="/services" className="block text-sm text-gray-400 hover:text-luxury-gold transition-colors">
                Services
              </Link>
              <Link href="/gallery" className="block text-sm text-gray-400 hover:text-luxury-gold transition-colors">
                Gallery
              </Link>
              <Link href="/booking" className="block text-sm text-gray-400 hover:text-luxury-gold transition-colors">
                Book Now
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-luxury-gold" />
                (555) 123-4567
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-luxury-gold" />
                hello@prisanbeauty.com
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-luxury-gold" />
                123 Beauty Lane, Suite 100
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Prisan Beauty. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
