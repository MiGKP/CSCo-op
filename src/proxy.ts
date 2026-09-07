import { NextRequest, NextResponse } from "next/server";
import { verifyInstructorSessionToken } from "./lib/instructor-auth";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/v1")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/instructor")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("instructor_session")?.value;
  const session = await verifyInstructorSessionToken(sessionCookie);

  if (pathname === "/login") {
    if (session.valid) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!session.valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Unauthorized: Please log in as instructor",
          code: "UNAUTHORIZED",
        },
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
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
