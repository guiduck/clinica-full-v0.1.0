import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { hashPassword } from "@/lib/auth/password";
import { accountVerificationEmail } from "@/emails/account-verification";
import { passwordResetEmail } from "@/emails/password-reset";
import { getPublicAppUrl, isEmailConfigured } from "@/services/email/email-config";
import { sendTransactionalEmail } from "@/services/email/email-sender";
import { AUTH_TOKEN_KINDS, consumeAuthToken, issueAuthCode, issueAuthToken, verifyAuthCode } from "./auth-tokens";

export async function sendAccountVerification(user: { id: string; name: string; email: string }) {
  const token = await issueAuthToken(user.id, AUTH_TOKEN_KINDS.emailVerification, 24 * 60);
  const url = `${getPublicAppUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendTransactionalEmail({ to: user.email, ...accountVerificationEmail(user.name, url) });
}

export async function verifyAccountEmail(token: string) {
  const record = await consumeAuthToken(token, AUTH_TOKEN_KINDS.emailVerification);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.authToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
  ]);
}

export async function requestPasswordReset(email: string) {
  if (!isEmailConfigured()) {
    throw new DomainError("EMAIL_NOT_CONFIGURED", "O provedor de e-mail ainda não foi configurado.");
  }
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return;
  const code = await issueAuthCode(user.id, user.email, AUTH_TOKEN_KINDS.passwordReset, 15);
  const url = `${getPublicAppUrl()}/recuperar-senha`;
  await sendTransactionalEmail({ to: user.email, ...passwordResetEmail(user.name, code, url) });
}

export async function resetPassword(token: string, password: string) {
  const record = await consumeAuthToken(token, AUTH_TOKEN_KINDS.passwordReset);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: hashPassword(password), emailVerifiedAt: new Date() } }),
    prisma.authToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);
}

export async function resetPasswordWithCode(email: string, code: string, password: string) {
  const record = await verifyAuthCode(email, code, AUTH_TOKEN_KINDS.passwordReset);
  await prisma.$transaction(async (transaction) => {
    const claimed = await transaction.authToken.updateMany({
      where: { id: record.id, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    if (claimed.count !== 1) throw new DomainError("INVALID_TOKEN", "O código é inválido ou já expirou.");
    await transaction.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashPassword(password), emailVerifiedAt: new Date() },
    });
    await transaction.session.deleteMany({ where: { userId: record.userId } });
  });
}
