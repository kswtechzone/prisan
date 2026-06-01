export const dynamic = "force-dynamic"

import { GalleryContent } from "./gallery-content"
import { getGalleryImages } from "@/lib/actions"

const categories = [
  { value: "all", label: "All" },
  { value: "hair", label: "Hair" },
  { value: "nails", label: "Nails" },
  { value: "skincare", label: "Skincare" },
  { value: "makeup", label: "Makeup" },
  { value: "massage", label: "Massage" },
]

export default async function GalleryPage() {
  const images = await getGalleryImages()

  return <GalleryContent images={images} categories={categories} />
}
