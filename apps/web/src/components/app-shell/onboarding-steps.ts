export type OnboardingPlacement =
  "top" | "right" | "bottom" | "left" | "center";
export type OnboardingAdvance =
  | "next"
  | "click-target"
  | "user-menu"
  | "settings-selected"
  | "account-save"
  | "contact-save";

export type OnboardingStep = Readonly<{
  title: string;
  description: string;
  targetIds?: readonly string[];
  placement?: OnboardingPlacement;
  advance?: OnboardingAdvance;
  shellState?: "navigation-open" | "user-menu-open";
  blockedHint?: string;
}>;

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    title: "Bem-vinda, {userName}! 👋",
    description:
      "Este tour rápido leva cerca de 3 minutinhos e vai te mostrar como usar a plataforma no dia a dia.\n\nA gente vai destacar cada área que você precisa conhecer. Se em algum momento quiser sair, é só clicar em \"Pular\".",
    placement: "center",
  },
  {
    title: "Seu resumo do dia",
    description:
      "Aqui no Dashboard você vê tudo importante rapidinho: quantos pacientes tem hoje, quanto entrou de dinheiro, quem falta pagar.",
    targetIds: ["tour-dashboard-summary"],
    placement: "bottom",
  },
  {
    title: "Notificações",
    description:
      "Este sininho avisa quando algo precisa da sua atenção: pagamentos em atraso, documentos para assinar, aniversários de pacientes...",
    targetIds: ["tour-notifications"],
    placement: "bottom",
  },
  {
    title: "Abra o menu principal",
    description:
      "Clique aqui pra abrir o menu completo com todas as áreas do sistema.",
    targetIds: ["tour-sidebar-toggle", "tour-sidebar-toggle-mobile"],
    placement: "right",
    advance: "click-target",
  },
  {
    title: "Pacientes",
    description:
      "Aqui você cadastra e organiza todos os seus pacientes. Guarda dados, prontuário, documentos, histórico financeiro... tudo em um lugar só.",
    targetIds: ["tour-nav-pacientes"],
    placement: "right",
    shellState: "navigation-open",
  },
  {
    title: "Agenda",
    description:
      "Sua agenda de sessões: marca, remarca e vê o que tem no dia, na semana ou no mês.",
    targetIds: ["tour-nav-agenda"],
    placement: "right",
    shellState: "navigation-open",
  },
  {
    title: "Financeiro",
    description:
      "Aqui você acompanha o dinheiro da clínica: receitas, despesas, quem pagou, quem deve. Também gera recibos e cobranças.",
    targetIds: ["tour-nav-financeiro"],
    placement: "right",
    shellState: "navigation-open",
  },
  {
    title: "Abra o menu da sua conta",
    description:
      "Clique aqui pra abrir o menu da sua conta. É por ele que você acessa as Configurações.",
    targetIds: ["tour-user-menu"],
    placement: "left",
    advance: "user-menu",
  },
  {
    title: "Vamos configurar sua conta",
    description:
      "Clique em \"Configurações\" para continuar o tutorial.",
    targetIds: ["tour-open-settings", "tour-user-menu-panel", "tour-user-menu"],
    placement: "left",
    advance: "settings-selected",
    shellState: "user-menu-open",
  },
  {
    title: "Preencha seu CPF",
    description:
      "Antes de tudo, preencha o seu CPF aqui. Ele é obrigatório e aparece em recibos e contratos que você emitir.",
    blockedHint: "Digite um CPF válido para continuar",
    targetIds: ["tour-settings-cpf"],
    placement: "right",
  },
  {
    title: "Salve seus dados",
    description: "Clique em \"Salvar\" para guardar seus dados profissionais.",
    targetIds: ["tour-settings-account-save"],
    placement: "top",
    advance: "account-save",
  },
  {
    title: "Suas abas de configuração",
    description:
      "Aqui você tem várias abas: seus dados profissionais, contato e endereço, mensagens automáticas, planos e segurança.\n\nAgora vamos para o endereço do consultório — vá até a aba \"Contato e endereço\".",
    targetIds: ["tour-settings-tabs"],
    placement: "bottom",
  },
  {
    title: "Aba Contato & Endereço",
    description: "Clique nesta aba para abrir o formulário do endereço da clínica.",
    targetIds: ["tour-settings-tab-contato"],
    placement: "bottom",
    advance: "click-target",
  },
  {
    title: "Preencha o endereço da clínica",
    description:
      "Preencha telefone, e-mail, CEP, rua, número, cidade e estado. Esses dados aparecem em recibos, contratos e mensagens automáticas.",
    targetIds: ["tour-settings-address"],
    placement: "left",
  },
  {
    title: "Salvar as informações",
    description: "Depois de preencher, clique em \"Salvar\" para guardar tudo.",
    targetIds: ["tour-settings-save"],
    placement: "top",
    advance: "contact-save",
  },
  {
    title: "Tudo pronto! 🎉",
    description:
      "Você já sabe o básico da Clínica Ágil.\n\nA partir daqui é só cadastrar seus pacientes, marcar sessões e acompanhar o financeiro. Vamos te levar de volta ao Dashboard.",
    placement: "center",
  },
] as const;
