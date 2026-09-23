import { z } from "zod";

export const scheduledMessageSchema = z
  .object({
    patientId: z.string().min(1, "Selecione o paciente."),
    channel: z.enum(["email", "whatsapp"]),
    subject: z.string().trim().max(160).optional(),
    body: z.string().trim().min(1, "Escreva a mensagem.").max(2000, "A mensagem deve ter até 2.000 caracteres."),
    scheduledFor: z.string().datetime({ offset: true, message: "Informe uma data e hora válidas." }),
  })
  .superRefine((value, context) => {
    if (value.channel === "email" && !value.subject) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: "Informe o assunto do e-mail.",
      });
    }
  });

export type ParsedScheduledMessageInput = z.infer<typeof scheduledMessageSchema>;
