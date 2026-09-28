import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/constants";

// Note: full JWT verification happens in the admin layout (Node runtime) and
// in API routes. Middleware runs on the Edge runtime, so it only checks for
// cookie presence to redirect unauthenticated users quickly.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
