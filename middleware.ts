import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

/**
 * Public routes that do NOT require an authenticated session. Everything else
 * is treated as part of the protected portal.
 */
const PUBLIC_PATHS: readonly string[] = ["/login", "/auth/error"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Edge middleware that enforces authentication on every portal route.
 *
 * - Unauthenticated users are redirected to `/login`, with a `callbackUrl`
 *   so they return to their original destination after sign-in.
 * - Already-authenticated users hitting `/login` are bounced to the dashboard.
 * - The Auth.js API routes, Next.js internals, and static assets are excluded
 *   via the `matcher` config below.
 */
export default auth((req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth);
  const pathname = nextUrl.pathname;

  if (isPublic(pathname)) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on all routes except Next.js internals, the Auth.js API,
  // static assets, and the favicon.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
