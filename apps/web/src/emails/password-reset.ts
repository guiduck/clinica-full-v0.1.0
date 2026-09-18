import { emailLayout } from "./layout";

export function passwordResetEmail(name: string, url: string) {
  const text = `Olá, ${name}. Redefina sua senha da clinica-full: ${url}. O link expira em 30 minutos.`;
  return {
    subject: "Redefina sua senha da clinica-full",
    text,
    html: emailLayout({
      preview: "Redefinição de senha da clinica-full",
      title: "Redefina sua senha",
      greeting: `Olá, ${name}.`,
      body: "Recebemos um pedido para criar uma nova senha. Se foi você, continue pelo botão abaixo.",
      actionLabel: "Criar nova senha",
      actionUrl: url,
      footer: "Este link expira em 30 minutos e só pode ser usado uma vez. Se você não pediu a troca, ignore esta mensagem.",
    }),
  };
}
