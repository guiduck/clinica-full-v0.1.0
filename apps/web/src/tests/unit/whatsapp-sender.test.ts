import { afterEach, describe, expect, it, vi } from "vitest";
import { getWhatsAppConfig } from "@/services/notifications/whatsapp-config";
import { TwilioWhatsAppSender } from "@/services/notifications/whatsapp-sender";

describe("whatsapp sender", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns null config when provider variables are missing", () => {
    expect(getWhatsAppConfig({} as NodeJS.ProcessEnv)).toBeNull();
  });

  it("sends through Twilio when configured", async () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "AC123");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "secret-token");
    vi.stubEnv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ sid: "SM123" })
      })
    );

    const result = await new TwilioWhatsAppSender().sendAppointmentConfirmationMessage({
      to: "5511999999999",
      body: "Mensagem"
    });

    expect(result).toEqual({ ok: true, providerMessageId: "SM123" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/Accounts/AC123/Messages.json"),
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("returns safe failure result when Twilio rejects the request", async () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "AC123");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "secret-token");
    vi.stubEnv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false
      })
    );

    const result = await new TwilioWhatsAppSender().sendAppointmentConfirmationMessage({
      to: "5511999999999",
      body: "Mensagem"
    });

    expect(result).toEqual({ ok: false, failureReason: "Falha operacional ao enviar WhatsApp." });
  });
});
