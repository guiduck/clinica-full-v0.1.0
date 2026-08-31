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
  brand: "Clinica Agil",
  heroTitle: "Clinica Agil",
  heroSubtitle:
    "Software para psicologos, terapeutas e psiquiatras autonomos organizarem pacientes, agenda, prontuario psicologico, financeiro, documentos e lembretes em um so lugar.",
  primaryCtaLabel: "Acessar area profissional",
  primaryCtaHref: publicRoutes.login,
  secondaryCtaLabel: "Ver recursos",
  seoKeywordPhrases,
  modules: [
    {
      title: "Pacientes",
      description:
        "Centralize cadastro, contatos, historico de atendimentos e dados essenciais para gestao de pacientes.",
      icon: UsersRound
    },
    {
      title: "Agenda",
      description:
        "Organize horarios, consultas e confirmacoes com uma agenda para terapeutas pensada para rotina clinica.",
      icon: CalendarDays
    },
    {
      title: "Prontuario",
      description:
        "Prepare uma base segura para evolucoes, observacoes e prontuario psicologico com clareza profissional.",
      icon: ClipboardCheck
    },
    {
      title: "Financeiro",
      description:
        "Acompanhe pagamentos, valores em aberto e financeiro para clinica sem perder o contexto do atendimento.",
      icon: Receipt
    },
    {
      title: "Documentos",
      description:
        "Deixe recibos, contratos e documentos clinicos prontos para um fluxo simples e organizado.",
      icon: FileText
    },
    {
      title: "Lembretes",
      description:
        "Tenha uma estrutura para lembretes e confirmacoes, incluindo WhatsApp em etapas futuras do MVP.",
      icon: HeartPulse
    }
  ],
  trustStatements: [
    "Privacidade e LGPD consideradas desde a primeira experiencia publica.",
    "Acesso seguro com autenticacao server-side e sessao por cookie HttpOnly.",
    "Organizacao clinica profissional sem expor dados sensiveis em paginas publicas.",
    "Login e cadastro ja funcionam sobre Prisma e PostgreSQL; recuperacao de senha e paginas legais seguem como proximos refinamentos."
  ]
} as const;
