import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decryptSensitiveValue,
  encryptSensitiveValue,
} from "@/lib/security/encryption";

afterEach(() => vi.unstubAllEnvs());

describe("clinical payload encryption", () => {
  it("round-trips JSON without exposing plaintext", () => {
    vi.stubEnv("SENSITIVE_DATA_ENCRYPTION_KEY", "a".repeat(64));
    const payload = { free: "conteúdo clínico sensível", mood: 7 };
    const encrypted = encryptSensitiveValue(payload);

    expect(encrypted).toMatch(/^v1\./);
    expect(encrypted).not.toContain(payload.free);
    expect(decryptSensitiveValue(encrypted)).toEqual(payload);
  });

  it("rejects tampered ciphertext", () => {
    vi.stubEnv("SENSITIVE_DATA_ENCRYPTION_KEY", "b".repeat(64));
    const encrypted = encryptSensitiveValue({ note: "registro" });
    const tampered = `${encrypted.slice(0, -1)}A`;
    expect(() => decryptSensitiveValue(tampered)).toThrow(
      "Não foi possível abrir o registro clínico criptografado.",
    );
  });
});
