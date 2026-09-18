import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { DomainError } from "@/lib/errors/domain-errors";

const ALGORITHM = "aes-256-gcm";

function encryptionKey() {
  const raw = process.env.SENSITIVE_DATA_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new DomainError("CONFIGURATION", "A chave de criptografia dos dados sensíveis não foi configurada.");
  }

  const key = /^[a-f\d]{64}$/i.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");

  if (key.length !== 32) {
    throw new DomainError("CONFIGURATION", "A chave de criptografia deve possuir exatamente 32 bytes.");
  }

  return key;
}

export function encryptSensitiveValue(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptSensitiveValue<T>(envelope: string): T {
  const [version, ivValue, tagValue, ciphertextValue] = envelope.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) {
    throw new DomainError("VALIDATION", "O registro criptografado possui formato inválido.");
  }

  try {
    const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]);
    return JSON.parse(plaintext.toString("utf8")) as T;
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError("VALIDATION", "Não foi possível abrir o registro clínico criptografado.");
  }
}
