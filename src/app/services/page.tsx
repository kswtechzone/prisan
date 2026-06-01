export const dynamic = "force-dynamic"

import { ServicesContent } from "./services-content"
import { getServices } from "@/lib/actions"

const categories = [
  { value: "all", label: "All" },
  { value: "hair", label: "Hair" },
  { value: "nails", label: "Nails" },
  { value: "skincare", label: "Skincare" },
  { value: "makeup", label: "Makeup" },
  { value: "massage", label: "Massage" },
]

export default async function ServicesPage() {
  const services = await getServices()

  return <ServicesContent services={services} categories={categories} />
}
