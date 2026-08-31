import type { WhatsAppSender } from "@/services/notifications/whatsapp-sender";

export function createFakeWhatsAppSender(result: Awaited<ReturnType<WhatsAppSender["sendAppointmentConfirmationMessage"]>>): WhatsAppSender {
  return {
    async sendAppointmentConfirmationMessage() {
      return result;
    }
  };
}

export const fixedNow = new Date("2026-05-26T12:00:00.000Z");
