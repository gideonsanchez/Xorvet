import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/send", "/receive", "/swap", "/buy", "/activity", "/settings", "/assets", "/wallet", "/admin"];
const AUTH_PAGES = ["/login", "/register"];
const SESSION_COOKIE = "xorvet_session";

const matches = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Optimistic redirects based on the presence of the session cookie.
 * The cookie is verified with Firebase in every layout and API route; this only avoids
 * rendering private pages for visitors who clearly are not signed in.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && matches(path, PROTECTED)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (hasSession && matches(path, AUTH_PAGES) && !request.nextUrl.searchParams.has("expired")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
