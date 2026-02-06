import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get("auth_session");
    const { pathname } = request.nextUrl;

    // Protected Routes
    if (pathname.startsWith("/create")) {
        const adminPassword = process.env.ADMIN_PASSWORD;
        // Check if cookie exists AND matches the password (basic security)
        if (!authCookie || (adminPassword && authCookie.value !== adminPassword)) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Redirect to proper page if already logged in
    if (pathname === "/login") {
        if (authCookie) {
            return NextResponse.redirect(new URL("/create", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/create/:path*", "/login"],
};
