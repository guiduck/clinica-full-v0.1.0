import { describe, expect, it } from "vitest";
import { buildAppointmentConfirmationMessage } from "@/services/notifications/appointment-confirmation-message";

describe("appointment notification pipeline contract", () => {
  it("keeps outbound confirmation as transactional WhatsApp copy only", () => {
    const message = buildAppointmentConfirmationMessage({
      patientName: "Maria",
      therapistName: "Dra Ana",
      startsAt: new Date("2026-06-10T12:00:00.000Z")
    });

    expect(message).toContain("consulta");
    expect(message).toContain("Responda apenas sim ou nao");
    expect(message).not.toContain("diagnostico");
    expect(message).not.toContain("pagamento");
  });
});
