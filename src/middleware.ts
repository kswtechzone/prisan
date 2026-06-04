import { auth } from "@/lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")
  const isAdminLogin = pathname === "/admin/login"
  const isProfileRoute = pathname === "/profile"

  if (isAdminRoute && !isAdminLogin) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url)
      loginUrl.searchParams.set("redirect", pathname)
      return Response.redirect(loginUrl)
    }
    if (req.auth.user?.role !== "admin") {
      return Response.redirect(new URL("/", req.url))
    }
  }

  if (isProfileRoute) {
    if (!req.auth) {
      return Response.redirect(new URL("/login", req.url))
    }
  }
})

export const config = {
  matcher: ["/admin/:path*", "/profile"],
}
