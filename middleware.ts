import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.log("Middleware running for:", req.nextUrl.pathname);
  }

  try {
    const token = await getToken({ req });

    if (!token) {
      if (isDev) console.log("No token found. Redirecting to /unauthorized.");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (isDev) console.log("User role:", token.role);

    if (token.role !== "admin") {
      if (isDev) console.log("User is not an admin. Redirecting to /unauthorized.");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (isDev) console.log("User is authenticated and an admin. Proceeding with the request.");
    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
