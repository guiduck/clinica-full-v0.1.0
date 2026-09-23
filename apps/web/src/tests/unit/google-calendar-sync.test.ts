import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  syncAppointmentToGoogleCalendar,
  syncUpcomingAppointmentsToGoogleCalendar,
} from "@/services/integrations/google-calendar";

const prismaMock = vi.hoisted(() => ({
  googleCalendarConnection: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  appointment: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/security/encryption", () => ({
  decryptSensitiveValue: () => "access-token",
  encryptSensitiveValue: (value: string) => value,
}));

const appointment = {
  id: "appointment-1",
  userId: "user-1",
  patientId: "patient-1",
  startsAt: new Date("2027-01-10T12:00:00.000Z"),
  endsAt: new Date("2027-01-10T12:50:00.000Z"),
  type: "Sessão individual",
  videoUrl: null,
  googleCalendarEventId: null,
  patient: { name: "Ana Teste" },
};

describe("Google Calendar appointment sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.googleCalendarConnection.findUnique.mockResolvedValue({
      accessTokenEncrypted: "encrypted",
      refreshTokenEncrypted: "refresh",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      calendarId: "primary",
    });
    prismaMock.appointment.findFirst.mockResolvedValue(appointment);
    prismaMock.appointment.update.mockResolvedValue(appointment);
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(new Response(
      JSON.stringify({ id: "google-event-1" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ))));
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uses the patient name instead of the product brand as event title", async () => {
    await syncAppointmentToGoogleCalendar("user-1", "appointment-1");
    const request = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(String((request[1] as RequestInit).body));
    expect(body.summary).toBe("Ana Teste");
    expect(body.description).toBe("Sessão individual");
  });

  it("reconciles future events even when they already have a Google id", async () => {
    prismaMock.appointment.findMany.mockResolvedValue([
      { id: "appointment-1" },
      { id: "appointment-2" },
    ]);
    prismaMock.appointment.findFirst
      .mockResolvedValueOnce(appointment)
      .mockResolvedValueOnce({
        ...appointment,
        id: "appointment-2",
        googleCalendarEventId: "existing-google-id",
      });

    const result = await syncUpcomingAppointmentsToGoogleCalendar("user-1");
    expect(result).toEqual({ synced: 2, failed: 0, considered: 2 });
    const query = prismaMock.appointment.findMany.mock.calls[0][0];
    expect(query.where).not.toHaveProperty("googleCalendarEventId");
    expect(query.take).toBe(100);
  });
});
