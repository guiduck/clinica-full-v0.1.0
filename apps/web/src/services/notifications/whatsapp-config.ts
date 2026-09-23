export type WhatsAppConfig = {
  accountSid: string;
  authToken: string;
  from: string;
  statusCallbackUrl: string | null;
};

export function getWhatsAppConfig(env: NodeJS.ProcessEnv = process.env): WhatsAppConfig | null {
  const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = env.TWILIO_AUTH_TOKEN?.trim();
  const from = env.TWILIO_WHATSAPP_FROM?.trim();

  if (!accountSid || !authToken || !from) {
    return null;
  }

  return {
    accountSid,
    authToken,
    from,
    statusCallbackUrl:
      env.TWILIO_STATUS_CALLBACK_URL?.trim() ||
      (env.NEXT_PUBLIC_APP_URL ? `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/webhooks/twilio/whatsapp` : null),
  };
}
