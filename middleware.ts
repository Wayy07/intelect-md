import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isLoginPage = req.nextUrl.pathname === "/admin/login"

    // Add the current path to the request headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-pathname", req.nextUrl.pathname)

    // If not logged in and trying to access admin routes (except login)
    if (!token && isAdminRoute && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    // If logged in but not admin, redirect to home
    if (token?.role !== "ADMIN" && isAdminRoute && !isLoginPage) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If logged in as admin and trying to access login page
    if (token?.role === "ADMIN" && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/inventar", req.url))
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true // Let the middleware function handle the auth logic
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}
