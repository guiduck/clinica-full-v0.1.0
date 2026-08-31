import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const appointmentSchema = z
  .object({
    patientId: z.string().trim().min(1, "Selecione um paciente."),
    startsAt: z.string().trim().min(1, "Informe o inicio da consulta."),
    endsAt: z.string().trim().min(1, "Informe o fim da consulta.")
  })
  .superRefine((value, ctx) => {
    const startsAt = new Date(value.startsAt);
    const endsAt = new Date(value.endsAt);

    if (Number.isNaN(startsAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe uma data de inicio valida.",
        path: ["startsAt"]
      });
    }

    if (Number.isNaN(endsAt.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe uma data de fim valida.",
        path: ["endsAt"]
      });
    }

    if (!Number.isNaN(startsAt.getTime()) && !Number.isNaN(endsAt.getTime()) && startsAt >= endsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O fim deve ser depois do inicio.",
        path: ["endsAt"]
      });
    }

    if (!Number.isNaN(startsAt.getTime()) && startsAt < new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A consulta nao pode ser criada no passado.",
        path: ["startsAt"]
      });
    }
  });

export const appointmentResolver = zodResolver(appointmentSchema);

export type AppointmentInput = z.input<typeof appointmentSchema>;
export type ParsedAppointmentInput = z.output<typeof appointmentSchema>;
