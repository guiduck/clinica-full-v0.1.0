import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth/constants";

const publicRoutes = ["/", "/login", "/criar-conta", "/recuperar-senha", "/termos", "/privacidade"];
const authRoutes = ["/login", "/criar-conta"];

function isPublicRoute(pathname: string) {
  return publicRoutes.includes(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(sessionCookieName)?.value);
  const isServerAction = request.headers.has("next-action");

  if (!hasSessionCookie && !isPublicRoute(pathname) && !pathname.startsWith("/api")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSessionCookie && authRoutes.includes(pathname) && !isServerAction) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
