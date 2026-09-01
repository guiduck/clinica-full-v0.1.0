import { CalendarDays, ClipboardCheck, FileText, HeartPulse, Receipt, UsersRound } from "lucide-react";
import { publicRoutes } from "@/lib/seo/public-routes";

export const seoKeywordPhrases = [
  "software para psicologos",
  "agenda para terapeutas",
  "prontuario psicologico",
  "gestao de pacientes",
  "financeiro para clinica",
  "recibos para terapeutas"
] as const;

export const landingContent = {
  brand: "Clínica Ágil",
  heroTitle: "Clínica Ágil",
  heroSubtitle:
    "Software para psicólogos, terapeutas e psiquiatras autônomos organizarem pacientes, agenda, prontuário psicológico, financeiro, documentos e lembretes em um só lugar.",
  primaryCtaLabel: "Acessar área profissional",
  primaryCtaHref: publicRoutes.login,
  secondaryCtaLabel: "Ver recursos",
  seoKeywordPhrases,
  modules: [
    {
      title: "Pacientes",
      description:
        "Centralize cadastro, contatos, histórico de atendimentos e dados essenciais para gestão de pacientes.",
      icon: UsersRound
    },
    {
      title: "Agenda",
      description:
        "Organize horários, consultas e confirmações com uma agenda para terapeutas pensada para a rotina clínica.",
      icon: CalendarDays
    },
    {
      title: "Prontuário",
      description:
        "Prepare uma base segura para evoluções, observações e prontuário psicológico com clareza profissional.",
      icon: ClipboardCheck
    },
    {
      title: "Financeiro",
      description:
        "Acompanhe pagamentos, valores em aberto e o financeiro da clínica sem perder o contexto do atendimento.",
      icon: Receipt
    },
    {
      title: "Documentos",
      description:
        "Deixe recibos, contratos e documentos clínicos prontos para um fluxo simples e organizado.",
      icon: FileText
    },
    {
      title: "Lembretes",
      description:
        "Tenha uma estrutura para lembretes e confirmações, incluindo WhatsApp em etapas futuras do MVP.",
      icon: HeartPulse
    }
  ],
  trustStatements: [
    "Privacidade e LGPD consideradas desde a primeira experiência pública.",
    "Acesso seguro com autenticação server-side e sessão por cookie HttpOnly.",
    "Organização clínica profissional sem expor dados sensíveis em páginas públicas.",
    "Login e cadastro já funcionam sobre Prisma e PostgreSQL; recuperação de senha e páginas legais seguem como próximos refinamentos."
  ]
} as const;
