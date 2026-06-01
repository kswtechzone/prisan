"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  const pathname = usePathname()
  if (pathname === "/contact") return null

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
              <Link href="/blog" className="block text-sm text-gray-400 hover:text-luxury-gold transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="block text-sm text-gray-400 hover:text-luxury-gold transition-colors">
                Contact
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
                <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
                <a href="tel:+9779747226605" className="hover:text-luxury-gold transition-colors">
                  9747226605
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-luxury-gold shrink-0" />
                <a href="mailto:prisanbeauty@gmail.com" className="hover:text-luxury-gold transition-colors">
                  prisanbeauty@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                <span>
                  Aloknagar, Baneshwor,<br />
                  Kathmandu, Nepal
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl overflow-hidden border border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d40077.319367109565!2d85.30407423476562!3d27.686801886553642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19f64524c439%3A0xc31c2a5953cab224!2sPriSan%20Beauty!5e1!3m2!1sen!2sus!4v1780299404202!5m2!1sen!2sus"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Prisan Beauty location"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} Prisan Beauty. All rights reserved.</span>
          <span>
            Developed by{" "}
            <a
              href="https://www.kswtechzone.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-luxury-gold hover:underline"
            >
              KSW TechZone
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
