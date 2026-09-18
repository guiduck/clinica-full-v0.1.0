import { describe, expect, it } from "vitest";
import {
  anamneseDraftSchema,
  evolutionDraftSchema,
} from "@/utils/validators/clinical-drafts";

describe("clinical draft validation", () => {
  it("accepts every anamnesis section including manual DSM/CID reference", () => {
    expect(
      anamneseDraftSchema.safeParse({
        hda: {
          description: "Queixa",
          precipitants: "Trabalho",
          previousAttempts: "Terapia",
        },
        personal: { narrative: "História", supportNetwork: "Família" },
        habits: {
          sleep: "8h",
          diet: "regular",
          physicalActivity: "caminhada",
          alcohol: "não",
          tobacco: "não",
          drugs: "não",
          leisure: "leitura",
        },
        mental: {
          appearance: "adequada",
          attitude: "colaborativa",
          consciousness: "lúcida",
          affect: "estável",
          thought: "organizado",
        },
        diagnosis: {
          cidDsm: "Referência manual: CID-11 6B00",
          objectives: "reduzir sintomas",
        },
      }).success,
    ).toBe(true);
  });

  it("accepts free or SOAP evolution, mood and optional appointment link", () => {
    expect(
      evolutionDraftSchema.safeParse({
        date: "01/09/2026",
        time: "18:00",
        mood: 2,
        appointmentId: "apt-1",
        free: "Registro livre",
      }).success,
    ).toBe(true);
    expect(
      evolutionDraftSchema.safeParse({
        date: "01/09/2026",
        time: "18:00",
        mood: 10,
        subjective: "Relato",
        objective: "Observação",
        assessment: "Avaliação",
        plan: "Plano",
      }).success,
    ).toBe(true);
  });

  it("rejects missing content, invalid mood, date and time", () => {
    expect(
      evolutionDraftSchema.safeParse({
        date: "09/01/2026",
        time: "25:00",
        mood: 0,
      }).success,
    ).toBe(false);
    expect(
      evolutionDraftSchema.safeParse({
        date: "31/02/2026",
        time: "18:00",
        mood: 5,
        free: "Registro",
      }).success,
    ).toBe(false);
    expect(
      evolutionDraftSchema.safeParse({
        date: "01/09/2026",
        time: "18:00",
        mood: 5,
      }).success,
    ).toBe(false);
  });
});
