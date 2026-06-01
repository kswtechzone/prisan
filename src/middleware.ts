import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const adminOnlyPaths = ["/admin", "/admin/bookings", "/admin/services", "/admin/stylists"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!adminOnlyPaths.includes(pathname)) return NextResponse.next()

  const session = request.cookies.get("session")?.value
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
