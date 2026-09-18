import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { getPublicAppUrl } from "@/services/email/email-config";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  id_token?: string;
};

type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
};

export function getGoogleOAuthConfig() {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function googleRedirectUri(path = "/api/auth/callback/google") {
  return `${getPublicAppUrl()}${path}`;
}

export function buildGoogleAuthorizationUrl(input: { state: string; redirectUri: string; scopes: string[]; offline?: boolean }) {
  const config = getGoogleOAuthConfig();
  if (!config) throw new DomainError("CONFIGURATION", "O login Google ainda não foi configurado.");
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: input.scopes.join(" "),
    state: input.state,
    include_granted_scopes: "true",
    prompt: input.offline ? "consent" : "select_account",
  });
  if (input.offline) params.set("access_type", "offline");
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const config = getGoogleOAuthConfig();
  if (!config) throw new DomainError("CONFIGURATION", "O Google OAuth ainda não foi configurado.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    cache: "no-store",
  });
  if (!response.ok) throw new DomainError("PROVIDER_FAILURE", "O Google recusou a autorização.");
  return await response.json() as GoogleTokenResponse;
}

export async function getGoogleProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new DomainError("PROVIDER_FAILURE", "Não foi possível consultar o perfil Google.");
  const profile = await response.json() as GoogleProfile;
  if (!profile.sub || !profile.email || !profile.email_verified) {
    throw new DomainError("VALIDATION", "A conta Google precisa possuir um e-mail verificado.");
  }
  return profile;
}

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const account = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: profile.sub } },
    include: { user: true },
  });
  if (account) return account.user;

  const email = profile.email.trim().toLowerCase();
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      update: { emailVerifiedAt: new Date() },
      create: { name: profile.name?.trim() || email.split("@")[0], email, passwordHash: null, emailVerifiedAt: new Date() },
    });
    await tx.oAuthAccount.create({ data: { userId: user.id, provider: "google", providerAccountId: profile.sub, email } });
    return user;
  });
}
