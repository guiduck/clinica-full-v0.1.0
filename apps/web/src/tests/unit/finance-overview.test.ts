import { describe, expect, it } from "vitest";
import { buildAppointmentFinanceEntries } from "@/services/finance/finance-overview";

describe("appointment finance projection", () => {
  const patients = [{
    id: "patient-1",
    name: "Ana",
    financialProfile: {
      isComplete: true,
      defaultSessionPriceCents: 15_000,
      preferredPaymentMethod: "pix",
    },
  }];

  it("projects eligible appointments without creating a persisted ledger", () => {
    const entries = buildAppointmentFinanceEntries(patients, [{
      id: "appointment-1",
      patientId: "patient-1",
      type: "Sessão individual",
      status: "agendada",
      startsAt: new Date("2026-09-10T12:00:00.000Z"),
      patient: { name: "Ana" },
    }]);
    expect(entries).toEqual([
      expect.objectContaining({
        id: "appointment-appointment-1",
        type: "receita",
        status: "previsto",
        valueCents: 15_000,
        paymentMethod: "pix",
      }),
    ]);
  });

  it("omits incomplete profiles and maps appointment outcomes", () => {
    const appointments = [{
      id: "appointment-1",
      patientId: "patient-1",
      type: "Sessão individual",
      status: "realizada",
      startsAt: new Date("2026-09-10T12:00:00.000Z"),
      patient: { name: "Ana" },
    }];
    expect(buildAppointmentFinanceEntries(patients, appointments)[0]?.status).toBe(
      "efetivado",
    );
    expect(
      buildAppointmentFinanceEntries(
        [{
          ...patients[0],
          financialProfile: {
            ...patients[0].financialProfile,
            isComplete: false,
          },
        }],
        appointments,
      ),
    ).toEqual([]);
  });
});
