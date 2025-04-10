// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("Middleware running for:", req.nextUrl.pathname);

  try {
    const token = await getToken({ req });

    if (!token) {
      console.log("No token found. Redirecting to /unauthorized.");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Log only non-sensitive information
    console.log("User role:", token.role);

    if (token.role !== "admin") {
      console.log("User is not an admin. Redirecting to /unauthorized.");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    console.log("User is authenticated and an admin. Proceeding with the request.");
    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
}

// Protect all routes under /admin/*
export const config = {
  matcher: ["/admin/:path*"], // Apply middleware to /admin and all subpaths
};
