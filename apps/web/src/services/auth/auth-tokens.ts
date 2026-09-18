import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";

export const AUTH_TOKEN_KINDS = {
  emailVerification: "email_verification",
  passwordReset: "password_reset",
} as const;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueAuthToken(userId: string, kind: string, ttlMinutes: number) {
  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.authToken.deleteMany({ where: { userId, kind, consumedAt: null } }),
    prisma.authToken.create({ data: { userId, kind, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + ttlMinutes * 60_000) } }),
  ]);
  return token;
}

export async function consumeAuthToken(token: string, kind: string) {
  const record = await prisma.authToken.findUnique({ where: { tokenHash: tokenHash(token) } });
  if (!record || record.kind !== kind || record.consumedAt || record.expiresAt <= new Date()) {
    throw new DomainError("INVALID_TOKEN", "Este link é inválido ou já expirou.");
  }
  return record;
}
