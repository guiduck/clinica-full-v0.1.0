import { describe, expect, it } from "vitest";
import {
  messageTemplateSchema,
  settingsAccountSchema,
  settingsContactSchema,
  settingsImageSchema,
  settingsPlanSchema,
} from "@/utils/validators/settings";

describe("settings validation", () => {
  it("validates CPF while keeping specialty optional", () => {
    expect(
      settingsAccountSchema.safeParse({
        name: "Gui",
        email: "gui@example.com",
        cpf: "529.982.247-25",
        specialty: "",
      }).success,
    ).toBe(true);
    expect(
      settingsAccountSchema.safeParse({
        name: "Gui",
        email: "gui@example.com",
        cpf: "111.111.111-11",
      }).success,
    ).toBe(false);
  });

  it("validates Brazilian phone, CEP and optional clinic CNPJ", () => {
    const base = {
      phone: "(61) 98272-4656",
      street: "Rua A, 1",
      city: "Brasília",
      state: "DF",
      zip: "70000-000",
    };
    expect(settingsContactSchema.safeParse(base).success).toBe(true);
    expect(
      settingsContactSchema.safeParse({
        ...base,
        clinicName: "Clínica",
        clinicCnpj: "04.252.011/0001-10",
        clinicPhone: "(61) 3333-4444",
      }).success,
    ).toBe(true);
    expect(
      settingsContactSchema.safeParse({ ...base, zip: "123" }).success,
    ).toBe(false);
  });

  it("enforces the 2 MB image, plan duration and positive value constraints", () => {
    expect(
      settingsImageSchema.safeParse({
        size: 2 * 1024 * 1024,
        type: "image/png",
      }).success,
    ).toBe(true);
    expect(
      settingsImageSchema.safeParse({
        size: 2 * 1024 * 1024 + 1,
        type: "image/png",
      }).success,
    ).toBe(false);
    expect(
      settingsPlanSchema.safeParse({
        name: "Mensal",
        sessions: "4",
        months: "1",
        valueCents: 50000,
      }).success,
    ).toBe(true);
    expect(
      settingsPlanSchema.safeParse({
        name: "Mensal",
        sessions: 4,
        months: 0,
        valueCents: 0,
      }).success,
    ).toBe(false);
  });

  it("accepts documented placeholders and rejects unknown ones", () => {
    expect(
      messageTemplateSchema.safeParse(
        "Olá {{nomePaciente}}, sessão em {{data}} às {{horario}}",
      ).success,
    ).toBe(true);
    expect(messageTemplateSchema.safeParse("Olá {{senha}}").success).toBe(
      false,
    );
  });
});
