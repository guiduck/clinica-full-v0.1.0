export type EmailProvider = "resend" | "sendgrid";

export function getEmailConfig() {
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const from = process.env.EMAIL_FROM?.trim();
  if ((provider !== "resend" && provider !== "sendgrid") || !from) return null;

  const apiKey = provider === "resend"
    ? process.env.RESEND_API_KEY?.trim()
    : process.env.SENDGRID_API_KEY?.trim();

  if (!apiKey) return null;
  return { provider: provider as EmailProvider, apiKey, from };
}

export function isEmailConfigured() {
  return Boolean(getEmailConfig());
}

export function isEmailVerificationRequired() {
  return process.env.EMAIL_REQUIRE_VERIFICATION === "true" && isEmailConfigured();
}

export function getPublicAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
