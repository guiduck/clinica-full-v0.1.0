import { emailLayout } from "./layout";

export function accountVerificationEmail(name: string, url: string) {
  const text = `Olá, ${name}. Confirme seu e-mail para ativar sua conta clinica-full: ${url}. O link expira em 24 horas.`;
  return {
    subject: "Confirme sua conta na clinica-full",
    text,
    html: emailLayout({
      preview: "Confirme seu e-mail na clinica-full",
      title: "Confirme seu e-mail",
      greeting: `Olá, ${name}.`,
      body: "Use o botão abaixo para confirmar que este endereço de e-mail pertence a você.",
      actionLabel: "Confirmar minha conta",
      actionUrl: url,
      footer: "Este link expira em 24 horas. Se você não criou esta conta, ignore esta mensagem.",
    }),
  };
}
