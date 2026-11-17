import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleDashboards: Record<string, string> = {
  ADMIN: "/owner",
  OWNER: "/owner",
  MANAGER: "/manager",
  RECEPTIONIST: "/reception",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("user_role")?.value?.toUpperCase();

  const isAuthPage = pathname.startsWith("/login");
  const isDashboardRoute =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/reception");

  // Redirect unauthenticated user trying to access protected dashboard routes to /login
  if (isDashboardRoute && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user visiting /login to their role dashboard
  if (isAuthPage && accessToken && userRole) {
    const destination = roleDashboards[userRole] || "/reception";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Role authorization checks for protected dashboard areas
  if (isDashboardRoute && userRole) {
    if (pathname.startsWith("/owner") && !["OWNER", "ADMIN"].includes(userRole)) {
      const fallback = roleDashboards[userRole] || "/reception";
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    if (pathname.startsWith("/manager") && !["MANAGER", "OWNER", "ADMIN"].includes(userRole)) {
      const fallback = roleDashboards[userRole] || "/reception";
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    if (
      pathname.startsWith("/reception") &&
      !["RECEPTIONIST", "MANAGER", "OWNER", "ADMIN"].includes(userRole)
    ) {
      const fallback = roleDashboards[userRole] || "/reception";
      return NextResponse.redirect(new URL(fallback, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/owner/:path*", "/manager/:path*", "/reception/:path*"],
};
