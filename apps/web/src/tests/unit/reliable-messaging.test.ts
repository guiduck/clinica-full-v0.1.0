import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { appointmentStatusStyle } from "@/constants/appointment-status";
import { getRedisUrl } from "@/services/messages/message-queue";
import { validateTwilioSignature } from "@/services/notifications/twilio-webhook";
import { scheduledMessageSchema } from "@/utils/validators/scheduled-message";

describe("reliable messaging primitives", () => {
  it("requires an explicit Redis URL", () => {
    expect(getRedisUrl({})).toBeNull();
    expect(getRedisUrl({ REDIS_URL: " redis://localhost:6380/0 " })).toBe("redis://localhost:6380/0");
  });

  it("validates Twilio webhook signatures with sorted parameters", () => {
    const url = "https://clinica-full.gfig.space/api/webhooks/twilio/whatsapp";
    const authToken = "test-token";
    const params = new URLSearchParams({ To: "whatsapp:+14155238886", From: "whatsapp:+5561999999999", Body: "sim" });
    const sorted = [...params.keys()].sort().map((key) => `${key}${params.get(key) ?? ""}`).join("");
    const signature = createHmac("sha1", authToken).update(`${url}${sorted}`).digest("base64");
    expect(validateTwilioSignature({ authToken, signature, url, params })).toBe(true);
    expect(validateTwilioSignature({ authToken, signature: `${signature}x`, url, params })).toBe(false);
  });

  it("validates scheduled messages and keeps completed sessions blue", () => {
    const parsed = scheduledMessageSchema.safeParse({
      patientId: "cmud24zz0000f9liocmn1ugw2",
      channel: "email",
      subject: "Lembrete",
      body: "Sua consulta está confirmada.",
      scheduledFor: "2026-09-24T12:00:00.000Z",
    });
    expect(parsed.success).toBe(true);
    expect(appointmentStatusStyle("realizada")).toContain("text-info");
  });
});
