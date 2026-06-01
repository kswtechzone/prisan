export const dynamic = "force-dynamic"

import { DollarSign, Clock } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getServices } from "@/lib/actions"
import { formatPrice } from "@/lib/utils"
import { ServiceForm } from "./service-form"
import { DeleteServiceButton } from "./delete-button"

export default async function AdminServicesPage() {
  const services = await getServices()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
          Services
        </h1>
        <ServiceForm />
      </div>

      <div className="grid gap-4">
        {services.map((svc) => (
          <Card key={svc.id}>
            <CardContent className="p-6 flex items-start gap-5">
              {svc.image && (
                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200">
                  <Image
                    src={svc.image}
                    alt={svc.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium truncate">{svc.name}</h3>
                  <Badge className="bg-luxury-gold/10 text-luxury-gold capitalize text-xs shrink-0">
                    {svc.category}
                  </Badge>
                  {!svc.active && (
                    <Badge className="bg-gray-100 text-gray-500 text-xs shrink-0">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {svc.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatPrice(svc.price)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {svc.duration} min
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DeleteServiceButton id={svc.id} name={svc.name} />
                <ServiceForm service={svc} />
              </div>
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-400">
              No services yet. Create your first service.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
