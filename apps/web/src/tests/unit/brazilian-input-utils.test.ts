import { describe, expect, it } from "vitest";
import { formatBrazilianDate, formatBrlFromCents, formatTime24 } from "@/utils/formatters";
import { applyMaskedEdit, maskBrazilianDate, maskBrl, maskCep, maskCnpj, maskCpf, maskPhone } from "@/utils/masks";
import { digitsOnly, normalizeBrazilianDate, normalizeBrlCents, normalizeEmail, normalizeTime24 } from "@/utils/normalizers";

describe("Brazilian input utilities", () => {
  it("normalizes deterministic canonical values", () => {
    expect(digitsOnly("529.982.247-25")).toBe("52998224725");
    expect(normalizeEmail("  Pessoa@EXAMPLE.com ")).toBe("pessoa@example.com");
    expect(normalizeBrlCents("R$ 1.234,56")).toBe(123456);
    expect(normalizeTime24("23:59")).toBe("23:59");
    expect(normalizeTime24("24:00")).toBeNull();
  });

  it("parses valid leap dates and rejects impossible dates", () => {
    expect(normalizeBrazilianDate("29/02/2024")).toBe("2024-02-29");
    expect(normalizeBrazilianDate("29/02/2023")).toBeNull();
    expect(normalizeBrazilianDate("31/04/2026")).toBeNull();
  });

  it("applies progressive Brazilian masks for append and paste", () => {
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
    expect(maskCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
    expect(maskPhone("11999998888")).toBe("(11) 99999-8888");
    expect(maskCep("01310100")).toBe("01310-100");
    expect(maskBrazilianDate("27082026")).toBe("27/08/2026");
    expect(maskBrl("123456")).toContain("1.234,56");
  });

  it("keeps a predictable cursor for middle edits and deletion", () => {
    expect(applyMaskedEdit("529.82.247-25", 6, maskCpf)).toEqual({ value: "529.822.472-5", cursor: 6 });
    expect(applyMaskedEdit("", 0, maskCpf)).toEqual({ value: "", cursor: 0 });
  });

  it("formats BRL, dates and 24-hour time for São Paulo", () => {
    expect(formatBrlFromCents(123456)).toContain("1.234,56");
    expect(formatBrazilianDate("2026-08-27T15:30:00.000Z")).toBe("27/08/2026");
    expect(formatTime24("2026-08-27T15:30:00.000Z")).toBe("12:30");
  });
});
