import {
  handleTwilioWhatsAppWebhook,
  validateTwilioSignature,
} from "@/services/notifications/twilio-webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const publicUrl = process.env.TWILIO_WEBHOOK_URL?.trim() || request.url;
  const validationEnabled =
    process.env.TWILIO_VALIDATE_SIGNATURE !== "false" ||
    process.env.NODE_ENV === "production";

  if (
    validationEnabled &&
    (!authToken ||
      !signature ||
      !validateTwilioSignature({
        authToken,
        signature,
        url: publicUrl,
        params,
      }))
  ) {
    return new Response("Assinatura inválida.", { status: 403 });
  }

  await handleTwilioWhatsAppWebhook(params);
  return new Response("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
