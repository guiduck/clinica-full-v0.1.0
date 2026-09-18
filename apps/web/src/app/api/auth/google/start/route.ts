import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { buildGoogleAuthorizationUrl, getGoogleOAuthConfig, googleRedirectUri } from "@/services/auth/google-oauth";
import { getPublicAppUrl } from "@/services/email/email-config";

export async function GET() {
  if (!getGoogleOAuthConfig()) return NextResponse.redirect(`${getPublicAppUrl()}/login?google=unavailable`);
  const state = randomBytes(32).toString("base64url");
  const response = NextResponse.redirect(buildGoogleAuthorizationUrl({ state, redirectUri: googleRedirectUri(), scopes: ["openid", "email", "profile"] }));
  response.cookies.set("google_oauth_state", state, { httpOnly: true, secure: getPublicAppUrl().startsWith("https://"), sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
