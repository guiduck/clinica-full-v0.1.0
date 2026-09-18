import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildGoogleAuthorizationUrl, getGoogleOAuthConfig, googleRedirectUri } from "@/services/auth/google-oauth";
import { getPublicAppUrl } from "@/services/email/email-config";
import { GOOGLE_CALENDAR_CALLBACK_PATH } from "@/services/integrations/google-calendar";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${getPublicAppUrl()}/login?next=/configuracoes?tab=seguranca`);
  if (!getGoogleOAuthConfig()) return NextResponse.redirect(`${getPublicAppUrl()}/configuracoes?tab=seguranca&calendar=unavailable`);
  const state = randomBytes(32).toString("base64url");
  const redirectUri = googleRedirectUri(GOOGLE_CALENDAR_CALLBACK_PATH);
  const response = NextResponse.redirect(buildGoogleAuthorizationUrl({ state, redirectUri, scopes: ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar.events"], offline: true }));
  response.cookies.set("google_calendar_state", state, { httpOnly: true, secure: getPublicAppUrl().startsWith("https://"), sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
