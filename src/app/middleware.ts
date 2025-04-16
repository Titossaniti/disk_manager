import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname

    // Define public and protected paths
    const isPublicPath = path === "/login"
    const isProtectedPath = !isPublicPath

    // Get the session cookie
    const sessionCookie = request.cookies.get("session")?.value

    // If the path is protected and there's no session, redirect to login
    if (isProtectedPath && !sessionCookie) {
        const url = new URL("/login", request.url)
        return NextResponse.redirect(url)
    }

    // If the path is login and there's a session, redirect to dashboard
    if (isPublicPath && sessionCookie) {
        const url = new URL("/dashboard", request.url)
        return NextResponse.redirect(url)
    }

    // Continue with the request
    return NextResponse.next()
}

// Configure which paths Middleware will run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
