import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Read "route53-auth" from cookies
  const authCookie = request.cookies.get("route53-auth")?.value;
  
  let token = null;
  if (authCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie));
      token = parsed.state?.token || parsed.token || null;
    } catch {
      // ignore parse error
    }
  }

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/hosted-zones");
  const isLoginRoute = pathname === "/login";

  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLoginRoute) {
    const targetUrl = new URL("/hosted-zones", request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

// Protect dashboard, hosted-zones and capture login route
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hosted-zones/:path*",
    "/login",
  ],
};
