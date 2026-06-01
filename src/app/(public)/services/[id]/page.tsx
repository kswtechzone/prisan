export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Clock, DollarSign, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getService } from "@/lib/actions"
import { formatPrice } from "@/lib/utils"

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = await getService(id)
  if (!service) notFound()

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-luxury-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            {service.image && (
              <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden mb-6">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-luxury-charcoal mb-4">
              {service.name}
            </h1>
            <div className="flex items-center gap-6 mb-6">
              <span className="flex items-center gap-1 text-lg font-semibold text-luxury-gold">
                <DollarSign className="w-5 h-5" />
                {formatPrice(service.price)}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                {service.duration} minutes
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8">
              {service.description}
            </p>
            <Link href="/booking">
              <Button size="lg">Book Now</Button>
            </Link>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-4">
                  Service Details
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium capitalize">{service.category}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">{service.duration} min</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium text-luxury-gold">
                      {formatPrice(service.price)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Bookings</span>
                    <span className="font-medium">{service.bookingItems.length}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
