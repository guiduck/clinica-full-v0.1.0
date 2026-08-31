import { prisma } from "@/lib/prisma";

export async function listAppointments(userId: string) {
  return prisma.appointment.findMany({
    where: {
      userId
    },
    orderBy: {
      startsAt: "asc"
    },
    include: {
      patient: true,
      notifications: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    },
    take: 100
  });
}

export async function hasAppointmentOverlap(userId: string, startsAt: Date, endsAt: Date) {
  const overlap = await prisma.appointment.findFirst({
    where: {
      userId,
      startsAt: {
        lt: endsAt
      },
      endsAt: {
        gt: startsAt
      }
    },
    select: {
      id: true
    }
  });

  return Boolean(overlap);
}
