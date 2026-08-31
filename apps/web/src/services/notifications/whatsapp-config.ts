export type WhatsAppConfig = {
  accountSid: string;
  authToken: string;
  from: string;
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
    from
  };
}
