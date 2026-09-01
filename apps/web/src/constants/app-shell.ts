import {
  Calendar,
  LayoutDashboard,
  LineChart,
  Users,
  Wallet,
} from "lucide-react";

export const APP_NAVIGATION_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: Calendar },
] as const;

export const APP_FINANCE_ITEMS = [
  { href: "/financeiro", label: "Fluxo de caixa", icon: Wallet },
  {
    href: "/financeiro/previsibilidade",
    label: "Previsibilidade",
    icon: LineChart,
  },
] as const;

export const APP_SETTINGS_PATH = "/configuracoes";
export const APP_ONBOARDING_SETTINGS_PATH = "/configuracoes?tourStep=10";
