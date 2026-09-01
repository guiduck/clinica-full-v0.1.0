import type {
  OnboardingAdvance,
  OnboardingPlacement,
  OnboardingShellState,
  OnboardingStep,
} from "@/types/onboarding-tour";
import { SITE_NAME } from "@/constants/site";

export const ONBOARDING_ADVANCE = {
  NEXT: "next",
  CLICK_TARGET: "click-target",
  USER_MENU: "user-menu",
  SETTINGS_SELECTED: "settings-selected",
  ACCOUNT_SAVE: "account-save",
  CONTACT_SAVE: "contact-save",
} as const satisfies Record<string, OnboardingAdvance>;

export const ONBOARDING_PLACEMENT = {
  TOP: "top",
  RIGHT: "right",
  BOTTOM: "bottom",
  LEFT: "left",
  CENTER: "center",
} as const satisfies Record<string, OnboardingPlacement>;

export const ONBOARDING_SHELL_STATE = {
  NAVIGATION_OPEN: "navigation-open",
  USER_MENU_OPEN: "user-menu-open",
} as const satisfies Record<string, OnboardingShellState>;

export const ONBOARDING_LAYOUT = {
  cardWidth: 360,
  defaultCardHeight: 230,
  arrowInset: 16,
  arrowSize: 16,
  gap: 16,
  mobileBreakpoint: 640,
  targetPadding: 8,
} as const;

export const ONBOARDING_QUERY_KEYS = [
  "tourStep",
  "onboarding",
  "onboarging",
] as const;

export const ONBOARDING_CPF_STEP_INDEX = 9;
export const ONBOARDING_DEFAULT_BLOCKED_HINT =
  "Complete o dado obrigatório destacado para continuar";
export const ONBOARDING_CLICK_HINT = "Clique no destaque para avançar";

export const ONBOARDING_ARROW_CLASS_BY_PLACEMENT = {
  bottom: "-top-2 border-b-0 border-r-0",
  top: "-bottom-2 border-l-0 border-t-0",
  left: "-right-2 border-b-0 border-l-0",
  right: "-left-2 border-r-0 border-t-0",
} as const satisfies Record<Exclude<OnboardingPlacement, "center">, string>;

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    title: "Bem-vinda, {userName}! 👋",
    description:
      'Este tour rápido leva cerca de 3 minutinhos e vai te mostrar como usar a plataforma no dia a dia.\n\nA gente vai destacar cada área que você precisa conhecer. Se em algum momento quiser sair, é só clicar em "Pular".',
    placement: ONBOARDING_PLACEMENT.CENTER,
  },
  {
    title: "Seu resumo do dia",
    description:
      "Aqui no Dashboard você vê tudo importante rapidinho: quantos pacientes tem hoje, quanto entrou de dinheiro, quem falta pagar.",
    targetIds: ["tour-dashboard-summary"],
    placement: ONBOARDING_PLACEMENT.BOTTOM,
  },
  {
    title: "Notificações",
    description:
      "Este sininho avisa quando algo precisa da sua atenção: pagamentos em atraso, documentos para assinar, aniversários de pacientes...",
    targetIds: ["tour-notifications"],
    placement: ONBOARDING_PLACEMENT.BOTTOM,
  },
  {
    title: "Abra o menu principal",
    description:
      "Clique aqui pra abrir o menu completo com todas as áreas do sistema.",
    targetIds: ["tour-sidebar-toggle", "tour-sidebar-toggle-mobile"],
    placement: ONBOARDING_PLACEMENT.RIGHT,
    advance: ONBOARDING_ADVANCE.CLICK_TARGET,
  },
  {
    title: "Pacientes",
    description:
      "Aqui você cadastra e organiza todos os seus pacientes. Guarda dados, prontuário, documentos, histórico financeiro... tudo em um lugar só.",
    targetIds: ["tour-nav-pacientes"],
    placement: ONBOARDING_PLACEMENT.RIGHT,
    shellState: ONBOARDING_SHELL_STATE.NAVIGATION_OPEN,
  },
  {
    title: "Agenda",
    description:
      "Sua agenda de sessões: marca, remarca e vê o que tem no dia, na semana ou no mês.",
    targetIds: ["tour-nav-agenda"],
    placement: ONBOARDING_PLACEMENT.RIGHT,
    shellState: ONBOARDING_SHELL_STATE.NAVIGATION_OPEN,
  },
  {
    title: "Financeiro",
    description:
      "Aqui você acompanha o dinheiro da clínica: receitas, despesas, quem pagou, quem deve. Também gera recibos e cobranças.",
    targetIds: ["tour-nav-financeiro"],
    placement: ONBOARDING_PLACEMENT.RIGHT,
    shellState: ONBOARDING_SHELL_STATE.NAVIGATION_OPEN,
  },
  {
    title: "Abra o menu da sua conta",
    description:
      "Clique aqui pra abrir o menu da sua conta. É por ele que você acessa as Configurações.",
    targetIds: ["tour-user-menu"],
    placement: ONBOARDING_PLACEMENT.LEFT,
    advance: ONBOARDING_ADVANCE.USER_MENU,
  },
  {
    title: "Vamos configurar sua conta",
    description: 'Clique em "Configurações" para continuar o tutorial.',
    targetIds: ["tour-open-settings", "tour-user-menu-panel", "tour-user-menu"],
    placement: ONBOARDING_PLACEMENT.LEFT,
    advance: ONBOARDING_ADVANCE.SETTINGS_SELECTED,
    shellState: ONBOARDING_SHELL_STATE.USER_MENU_OPEN,
  },
  {
    title: "Preencha seu CPF",
    description:
      "Antes de tudo, preencha o seu CPF aqui. Ele é obrigatório e aparece em recibos e contratos que você emitir.",
    blockedHint: "Digite um CPF válido para continuar",
    targetIds: ["tour-settings-cpf"],
    placement: ONBOARDING_PLACEMENT.RIGHT,
  },
  {
    title: "Salve seus dados",
    description: 'Clique em "Salvar" para guardar seus dados profissionais.',
    targetIds: ["tour-settings-account-save"],
    placement: ONBOARDING_PLACEMENT.TOP,
    advance: ONBOARDING_ADVANCE.ACCOUNT_SAVE,
  },
  {
    title: "Suas abas de configuração",
    description:
      'Aqui você tem várias abas: seus dados profissionais, contato e endereço, mensagens automáticas, planos e segurança.\n\nAgora vamos para o endereço do consultório — vá até a aba "Contato e endereço".',
    targetIds: ["tour-settings-tabs"],
    placement: ONBOARDING_PLACEMENT.BOTTOM,
  },
  {
    title: "Aba Contato & Endereço",
    description:
      "Clique nesta aba para abrir o formulário do endereço da clínica.",
    targetIds: ["tour-settings-tab-contato"],
    placement: ONBOARDING_PLACEMENT.BOTTOM,
    advance: ONBOARDING_ADVANCE.CLICK_TARGET,
  },
  {
    title: "Preencha o endereço da clínica",
    description:
      "Preencha telefone, e-mail, CEP, rua, número, cidade e estado. Esses dados aparecem em recibos, contratos e mensagens automáticas.",
    targetIds: ["tour-settings-address"],
    placement: ONBOARDING_PLACEMENT.LEFT,
  },
  {
    title: "Salvar as informações",
    description: 'Depois de preencher, clique em "Salvar" para guardar tudo.',
    targetIds: ["tour-settings-save"],
    placement: ONBOARDING_PLACEMENT.TOP,
    advance: ONBOARDING_ADVANCE.CONTACT_SAVE,
  },
  {
    title: "Tudo pronto! 🎉",
    description: `Você já sabe o básico da ${SITE_NAME}.\n\nA partir daqui é só cadastrar seus pacientes, marcar sessões e acompanhar o financeiro. Vamos te levar de volta ao Dashboard.`,
    placement: ONBOARDING_PLACEMENT.CENTER,
  },
] as const;
