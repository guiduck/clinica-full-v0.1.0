import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGoogleAuthorizationUrl,
  googleRedirectUri,
} from "@/services/auth/google-oauth";

afterEach(() => vi.unstubAllEnvs());

describe("Google OAuth configuration", () => {
  it("uses the production callback already registered in Google Cloud", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://clinica-full.gfig.space/");
    expect(googleRedirectUri()).toBe(
      "https://clinica-full.gfig.space/api/auth/callback/google",
    );
  });

  it("builds an authorization URL without exposing the client secret", () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "client-id.apps.googleusercontent.com");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "do-not-expose");
    const url = new URL(buildGoogleAuthorizationUrl({
      state: "state-value",
      redirectUri: "https://clinica-full.gfig.space/api/auth/callback/google",
      scopes: ["openid", "email", "profile"],
    }));

    expect(url.searchParams.get("client_id")).toBe("client-id.apps.googleusercontent.com");
    expect(url.searchParams.get("state")).toBe("state-value");
    expect(url.toString()).not.toContain("do-not-expose");
  });
});
