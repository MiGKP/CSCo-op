import { NextRequest, NextResponse } from "next/server";
import { verifyInstructorSessionToken } from "./lib/instructor-auth";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Allow static files, Next.js assets, and external Student Portal API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/v1") // External student web integration via Bearer token
  ) {
    return NextResponse.next();
  }

  // 2. Allow instructor auth endpoints
  if (pathname.startsWith("/api/auth/instructor")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("instructor_session")?.value;
  const session = await verifyInstructorSessionToken(sessionCookie);

  // 3. Handle /login route
  if (pathname === "/login") {
    if (session.valid) {
      // If already logged in, redirect to dashboard
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 4. Protect all other instructor pages and internal APIs
  if (!session.valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in as instructor", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files with extensions
     */
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
