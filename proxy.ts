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
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

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

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
 matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/maintenance/:path*",
    "/medscard/:path*",
    "/vitamins/:path*",
    "/patientForm/:path*",
    "/maintenanceForm/:path*",
    "/medscardForm/:path*",
    "/vitaminsForm/:path*",
    "/reports/:path*",
  ],
};