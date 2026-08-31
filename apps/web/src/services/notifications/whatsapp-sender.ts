import { getWhatsAppConfig } from "./whatsapp-config";

export type WhatsAppSendResult =
  | {
      ok: true;
      providerMessageId: string;
    }
  | {
      ok: false;
      failureReason: string;
    };

export type WhatsAppSender = {
  sendAppointmentConfirmationMessage(input: {
    to: string;
    body: string;
  }): Promise<WhatsAppSendResult>;
};

export class TwilioWhatsAppSender implements WhatsAppSender {
  async sendAppointmentConfirmationMessage(input: {
    to: string;
    body: string;
  }): Promise<WhatsAppSendResult> {
    const config = getWhatsAppConfig();

    if (!config) {
      return {
        ok: false,
        failureReason: "WhatsApp nao configurado."
      };
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          From: config.from,
          To: input.to.startsWith("whatsapp:") ? input.to : `whatsapp:+${input.to}`,
          Body: input.body
        })
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        failureReason: "Falha operacional ao enviar WhatsApp."
      };
    }

    const data = (await response.json()) as { sid?: string };

    return {
      ok: true,
      providerMessageId: data.sid ?? "twilio-message"
    };
  }
}
