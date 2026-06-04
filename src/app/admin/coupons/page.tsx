export const dynamic = "force-dynamic"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getCouponCodes } from "@/lib/actions"
import { formatDateShort } from "@/lib/utils"
import { Gift, Ticket } from "lucide-react"

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700"
    case "redeemed":
      return "bg-blue-100 text-blue-700"
    case "expired":
      return "bg-gray-100 text-gray-500"
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    default:
      return "bg-gray-100 text-gray-500"
  }
}

export default async function AdminCouponsPage() {
  const coupons = await getCouponCodes()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            Coupon Codes
          </h1>
          <p className="text-gray-500 text-sm">
            All coupon codes generated from spin game and admin-issued rewards
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Coupon Code
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Reward / Offer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Discount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Date Claimed
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.user.fullName}</div>
                      <div className="text-xs text-gray-400">{c.user.email}</div>
                      {c.user.mobile && (
                        <div className="text-xs text-gray-400">{c.user.mobile}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-semibold text-luxury-charcoal bg-gray-100 px-2 py-1 rounded">
                        {c.couponCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                        <span>{c.reward}</span>
                      </div>
                      {c.offer && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {c.offer.title}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.discountPercent && c.discountPercent > 0 ? (
                        <span className="font-medium text-green-600">
                          {c.discountPercent}% off
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.category ? (
                        <span className="capitalize text-gray-600">{c.category}</span>
                      ) : (
                        <span className="text-gray-400">All</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadge(c.status)}>
                        <Ticket className="w-3 h-3 mr-1 inline" />
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs capitalize">
                        {c.offer ? "Spin Game" : "Admin"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                      {formatDateShort(c.createdAt)}
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <div className="text-lg mb-1">No coupon codes yet</div>
                      <div className="text-sm">
                        Coupon codes will appear here once users spin and win rewards.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
