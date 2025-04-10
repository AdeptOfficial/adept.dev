// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Retrieve the token from the request
  const token = await getToken({ req });

  // Debugging logs (optional)
  console.log("Middleware running for:", req.nextUrl.pathname);
  console.log("Token:", token);

  // If no token is found, redirect to the login page
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If the user is not an admin, redirect to the unauthorized page
  if (token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Protect all routes under /admin/*
export const config = {
  matcher: ["/admin/:path*"], // Apply middleware to /admin and all subpaths
};
