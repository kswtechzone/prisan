export const dynamic = "force-dynamic"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStylists } from "@/lib/actions"
import { StylistForm } from "./stylist-form"
import { DeleteStylistButton } from "./delete-button"

export default async function AdminStylistsPage() {
  const stylists = await getStylists()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
          Stylists
        </h1>
        <StylistForm />
      </div>

      <div className="grid gap-4">
        {stylists.map((styl) => (
          <Card key={styl.id}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium">{styl.name}</h3>
                  {!styl.active && (
                    <Badge className="bg-gray-100 text-gray-500 text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{styl.bio}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <DeleteStylistButton id={styl.id} />
                <StylistForm stylist={styl} />
              </div>
            </CardContent>
          </Card>
        ))}
        {stylists.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-400">
              No stylists yet. Add your first stylist.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
