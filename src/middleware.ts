import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req: NextRequest & { auth: any }) => {
    // If user is not logged in and trying to access protected routes
    const isLoggedIn = !!req.auth
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/simulation')

    if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL('/login', req.nextUrl))
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
