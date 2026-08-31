export const DASHBOARD_SECTION_KEYS = ["appointments", "finance", "patients", "messages"] as const;
export type DashboardSectionKey = (typeof DASHBOARD_SECTION_KEYS)[number];

export type UserUiPreferenceView = Readonly<{
  onboardingStep: number;
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
  dashboardSectionOrder: DashboardSectionKey[] | null;
  hideFinancialValues: boolean;
  dismissedNewsBannerAt: string | null;
}>;

export type UserUiPreferenceOperation =
  | { operation: "advance_onboarding"; step: number }
  | { operation: "skip_onboarding" }
  | { operation: "restart_onboarding" }
  | { operation: "complete_onboarding" }
  | { operation: "set_financial_visibility"; hidden: boolean }
  | { operation: "dismiss_news_banner" }
  | { operation: "set_dashboard_order"; sectionKeys: readonly string[] };
