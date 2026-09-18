import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";

export const AUTH_TOKEN_KINDS = {
  emailVerification: "email_verification",
  passwordReset: "password_reset",
} as const;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function codeHash(email: string, code: string) {
  return tokenHash(`${normalizeEmail(email)}:${code}`);
}

function hashesMatch(left: string, right: string) {
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
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

export async function issueAuthCode(userId: string, email: string, kind: string, ttlMinutes: number) {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await prisma.$transaction([
    prisma.authToken.deleteMany({ where: { userId, kind, consumedAt: null } }),
    prisma.authToken.create({
      data: {
        userId,
        kind,
        tokenHash: codeHash(email, code),
        expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
      },
    }),
  ]);
  return code;
}

export async function verifyAuthCode(email: string, code: string, kind: string) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) }, select: { id: true } });
  if (!user) throw new DomainError("INVALID_TOKEN", "O código é inválido ou já expirou.");

  const record = await prisma.authToken.findFirst({
    where: { userId: user.id, kind, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  const isUnavailable = !record || record.expiresAt <= new Date() || record.attemptCount >= 5;
  if (isUnavailable) throw new DomainError("INVALID_TOKEN", "O código é inválido ou já expirou.");

  const matches = hashesMatch(record.tokenHash, codeHash(email, code));
  if (!matches) {
    await prisma.authToken.update({
      where: { id: record.id },
      data: {
        attemptCount: { increment: 1 },
        consumedAt: record.attemptCount + 1 >= 5 ? new Date() : null,
      },
    });
    throw new DomainError("INVALID_TOKEN", "O código é inválido ou já expirou.");
  }
  return record;
}
