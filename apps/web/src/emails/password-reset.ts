import { emailLayout } from "./layout";

export function passwordResetEmail(name: string, code: string, url: string) {
  const text = `Olá, ${name}. Seu código para redefinir a senha da clinica-full é ${code}. Ele expira em 15 minutos.`;
  return {
    subject: "Redefina sua senha da clinica-full",
    text,
    html: emailLayout({
      preview: "Redefinição de senha da clinica-full",
      title: "Redefina sua senha",
      greeting: `Olá, ${name}.`,
      body: "Recebemos um pedido para criar uma nova senha. Digite o código abaixo na tela de recuperação.",
      highlight: code,
      actionLabel: "Confirmar código e criar nova senha",
      actionUrl: url,
      footer: "Este código expira em 15 minutos, aceita no máximo 5 tentativas e só pode ser usado uma vez. Se você não pediu a troca, ignore esta mensagem.",
    }),
  };
}
