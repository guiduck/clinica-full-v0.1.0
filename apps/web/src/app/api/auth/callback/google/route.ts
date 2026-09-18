import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth/constants";
import { createSession } from "@/lib/auth/session";
import {
  exchangeGoogleCode,
  findOrCreateGoogleUser,
  getGoogleProfile,
  googleRedirectUri,
} from "@/services/auth/google-oauth";
import { getPublicAppUrl } from "@/services/email/email-config";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const storedState = request.cookies.get("google_oauth_state")?.value;
  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${getPublicAppUrl()}/login?google=invalid-state`);
  }

  try {
    const tokens = await exchangeGoogleCode(code, googleRedirectUri());
    if (!tokens.access_token) throw new Error("missing_access_token");
    const profile = await getGoogleProfile(tokens.access_token);
    const user = await findOrCreateGoogleUser(profile);
    const session = await createSession(user.id);
    const response = NextResponse.redirect(`${getPublicAppUrl()}/dashboard`);
    response.cookies.delete("google_oauth_state");
    response.cookies.set(sessionCookieName, session.token, {
      httpOnly: true,
      secure: getPublicAppUrl().startsWith("https://"),
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });
    return response;
  } catch {
    return NextResponse.redirect(`${getPublicAppUrl()}/login?google=failed`);
  }
}
