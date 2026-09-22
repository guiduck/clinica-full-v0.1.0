import { emailLayout } from "./layout";

export function patientWelcomeEmail(patientName: string, professionalName: string, appUrl: string) {
  const text = `Olá, ${patientName}. ${professionalName} cadastrou você na clinica-full para organizar seus atendimentos e comunicações autorizadas. Você receberá por e-mail apenas as informações relacionadas ao seu acompanhamento.`;
  return {
    subject: `Boas-vindas ao consultório de ${professionalName}`,
    text,
    html: emailLayout({
      preview: "Seu cadastro no consultório foi concluído",
      title: "Boas-vindas",
      greeting: `Olá, ${patientName}.`,
      body: `${professionalName} concluiu seu cadastro na clinica-full. Este endereço será usado somente para comunicações do seu acompanhamento que você autorizou.`,
      actionLabel: "Conhecer a clinica-full",
      actionUrl: appUrl,
      footer: "Se você não reconhece este cadastro ou não deseja receber comunicações, entre em contato diretamente com o profissional responsável.",
    }),
  };
}
