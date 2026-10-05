import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    return authenticated ? NextResponse.redirect(new URL("/budget", request.url)) : NextResponse.next();
  }

  if (authenticated) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("from", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Tout sauf les assets statiques et les fichiers PWA publics.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|swe-worker-.*\\.js|icons/).*)",
  ],
};
