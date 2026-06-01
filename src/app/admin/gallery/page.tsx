export const dynamic = "force-dynamic"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { getGalleryImages } from "@/lib/actions"
import { GalleryForm } from "./gallery-form"
import { DeleteGalleryButton } from "./delete-button"

export default async function AdminGalleryPage() {
  const images = await getGalleryImages()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
          Gallery
        </h1>
        <GalleryForm />
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img) => (
          <Card key={img.id} className="break-inside-avoid overflow-hidden">
            <div className="relative">
              <Image
                src={img.url}
                alt={img.caption || "Gallery image"}
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-2 right-2">
                <DeleteGalleryButton id={img.id} />
              </div>
            </div>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                {img.caption && (
                  <p className="text-sm font-medium truncate">{img.caption}</p>
                )}
                <span className="text-xs text-luxury-gold capitalize">{img.category}</span>
              </div>
              <GalleryForm image={img} />
            </CardContent>
          </Card>
        ))}
      </div>
      {images.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-gray-400">
            No images yet. Add your first gallery image.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
