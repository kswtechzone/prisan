import { prisma } from "@/lib/prisma"

export async function SeoMetaInjector() {
  let schemaScript: string | null = null

  try {
    const home = await prisma.seoMeta.findUnique({ where: { page: "home" } })
    if (home?.schemaJson) {
      schemaScript = home.schemaJson
    }
  } catch {
    return null
  }

  if (!schemaScript) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaScript }}
    />
  )
}
