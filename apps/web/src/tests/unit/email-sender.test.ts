import { afterEach, describe, expect, it, vi } from "vitest";
import { sendTransactionalEmail } from "@/services/email/email-sender";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("transactional e-mail provider", () => {
  it("sends through Resend with the configured verified sender", async () => {
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("EMAIL_FROM", "clinica-full <no-reply@mail.gfig.space>");
    vi.stubEnv("RESEND_API_KEY", "resend-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendTransactionalEmail({
      to: "patient@example.com",
      subject: "Confirme sua conta",
      text: "Texto",
      html: "<p>Texto</p>",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
