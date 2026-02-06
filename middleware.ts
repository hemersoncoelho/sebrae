import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get("auth_session");
    const { pathname } = request.nextUrl;

    // Protected Routes - Now covers everything except login and public assets
    // We check if it's NOT login to avoid infinite loop
    if (pathname !== "/login") {
        const adminPassword = process.env.ADMIN_PASSWORD;
        // Check if cookie exists AND matches the password (basic security)
        if (!authCookie || (adminPassword && authCookie.value !== adminPassword)) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Redirect to home if already logged in and trying to access login
    if (pathname === "/login") {
        if (authCookie) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svgs etc if served directly)
     */
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
