import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionCookieName } from "@/lib/auth/constants";
import type { UserDTO } from "@/types/api";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const isSecureCookie = (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https://");

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt
    }
  });

  return { token, expiresAt, maxAge: SESSION_MAX_AGE_SECONDS };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie,
    path: "/",
    expires: expiresAt
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashToken(token)
      }
    });
  }

  await clearSessionCookie();
}

export async function getCurrentUser(): Promise<UserDTO | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token)
    },
    include: {
      user: true
    }
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    await clearSessionCookie();
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email
  };
}
