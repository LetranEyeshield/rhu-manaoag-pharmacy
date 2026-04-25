import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/patients") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/medscard") ||
    pathname.startsWith("/vitamins") ||
    pathname.startsWith("/patientForm") ||
    pathname.startsWith("/maintenanceForm") ||
    pathname.startsWith("/medscardForm") ||
    pathname.startsWith("/vitaminsForm") ||
    pathname.startsWith("/reports");

  // ❌ Not logged in → block protected
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Logged in → redirect homepage to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ Logged in → block login/register
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // 👈 important
    "/dashboard/:path*",
    "/patients/:path*",
    "/maintenance/:path*",
    "/medscard/:path*",
    "/vitamins/:path*",
    "/new-patient/:path*",
    "/new-maintenance/:path*",
    "/new-medscard/:path*",
    "/new-vitamins/:path*",
    "/reports/:path*",
  ],
};