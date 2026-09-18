import { prisma } from "@/lib/prisma";
import { DomainError } from "@/lib/errors/domain-errors";
import { decryptSensitiveValue, encryptSensitiveValue } from "@/lib/security/encryption";
import { exchangeGoogleCode, getGoogleOAuthConfig, getGoogleProfile, googleRedirectUri } from "@/services/auth/google-oauth";

export const GOOGLE_CALENDAR_CALLBACK_PATH = "/api/integrations/google-calendar/callback";

export async function getGoogleCalendarConnectionStatus(userId: string) {
  const connection = await prisma.googleCalendarConnection.findUnique({ where: { userId }, select: { googleAccountEmail: true, updatedAt: true } });
  return connection ? { connected: true as const, email: connection.googleAccountEmail, updatedAt: connection.updatedAt.toISOString() } : { connected: false as const, email: null, updatedAt: null };
}

export async function connectGoogleCalendar(userId: string, code: string) {
  const redirectUri = googleRedirectUri(GOOGLE_CALENDAR_CALLBACK_PATH);
  const tokens = await exchangeGoogleCode(code, redirectUri);
  if (!tokens.access_token) throw new DomainError("PROVIDER_FAILURE", "O Google não devolveu um token de acesso.");
  const profile = await getGoogleProfile(tokens.access_token);
  const existing = await prisma.googleCalendarConnection.findUnique({ where: { userId } });
  const refreshToken = tokens.refresh_token || (existing ? decryptSensitiveValue<string>(existing.refreshTokenEncrypted) : null);
  if (!refreshToken) throw new DomainError("PROVIDER_FAILURE", "Autorize novamente o acesso ao calendário para liberar a sincronização contínua.");
  return prisma.googleCalendarConnection.upsert({
    where: { userId },
    update: {
      googleAccountEmail: profile.email,
      accessTokenEncrypted: encryptSensitiveValue(tokens.access_token),
      refreshTokenEncrypted: encryptSensitiveValue(refreshToken),
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      scope: tokens.scope ?? "https://www.googleapis.com/auth/calendar.events",
    },
    create: {
      userId,
      googleAccountEmail: profile.email,
      accessTokenEncrypted: encryptSensitiveValue(tokens.access_token),
      refreshTokenEncrypted: encryptSensitiveValue(refreshToken),
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      scope: tokens.scope ?? "https://www.googleapis.com/auth/calendar.events",
    },
  });
}

export async function disconnectGoogleCalendar(userId: string) {
  await prisma.googleCalendarConnection.deleteMany({ where: { userId } });
}

async function activeAccessToken(userId: string) {
  const connection = await prisma.googleCalendarConnection.findUnique({ where: { userId } });
  if (!connection) return null;
  if (connection.accessTokenEncrypted && connection.expiresAt && connection.expiresAt.getTime() > Date.now() + 60_000) {
    return { token: decryptSensitiveValue<string>(connection.accessTokenEncrypted), calendarId: connection.calendarId };
  }
  const config = getGoogleOAuthConfig();
  if (!config) throw new DomainError("CONFIGURATION", "As credenciais Google não estão configuradas.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, refresh_token: decryptSensitiveValue<string>(connection.refreshTokenEncrypted), grant_type: "refresh_token" }),
    cache: "no-store",
  });
  if (!response.ok) throw new DomainError("PROVIDER_FAILURE", "Não foi possível renovar a conexão com o Google Agenda.");
  const refreshed = await response.json() as { access_token?: string; expires_in?: number };
  if (!refreshed.access_token) throw new DomainError("PROVIDER_FAILURE", "O Google não devolveu um novo token de acesso.");
  await prisma.googleCalendarConnection.update({ where: { userId }, data: { accessTokenEncrypted: encryptSensitiveValue(refreshed.access_token), expiresAt: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000) : null } });
  return { token: refreshed.access_token, calendarId: connection.calendarId };
}

export async function syncAppointmentToGoogleCalendar(userId: string, appointmentId: string) {
  const access = await activeAccessToken(userId);
  if (!access) return { synced: false as const };
  const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, userId }, include: { patient: { select: { name: true } } } });
  if (!appointment) throw new DomainError("NOT_FOUND", "Consulta não encontrada para sincronização.");
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(access.calendarId)}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: `Consulta — ${appointment.patient.name}`,
      description: appointment.videoUrl ? `Videochamada: ${appointment.videoUrl}` : "Consulta criada pela clinica-full.",
      start: { dateTime: appointment.startsAt.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: appointment.endsAt.toISOString(), timeZone: "America/Sao_Paulo" },
    }),
  });
  if (!response.ok) throw new DomainError("PROVIDER_FAILURE", "A consulta foi criada, mas o Google Agenda recusou a sincronização.");
  const event = await response.json() as { id?: string };
  if (event.id) await prisma.appointment.update({ where: { id: appointment.id }, data: { googleCalendarEventId: event.id } });
  return { synced: Boolean(event.id) };
}
