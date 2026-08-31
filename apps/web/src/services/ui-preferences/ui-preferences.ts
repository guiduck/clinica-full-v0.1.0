import type { Prisma, UserUiPreference } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_SECTION_KEYS, type DashboardSectionKey, type UserUiPreferenceOperation, type UserUiPreferenceView } from "@/types/ui-preferences";

const MAX_ONBOARDING_STEP = 15;
const DEFAULTS: UserUiPreferenceView = { onboardingStep: 0, onboardingCompletedAt: null, onboardingSkippedAt: null, dashboardSectionOrder: null, hideFinancialValues: false, dismissedNewsBannerAt: null };

function sanitizeOrder(values: readonly string[]): DashboardSectionKey[] {
  return [...new Set(values)].filter((value): value is DashboardSectionKey => DASHBOARD_SECTION_KEYS.includes(value as DashboardSectionKey));
}

function toView(preference: Partial<UserUiPreference>): UserUiPreferenceView {
  const order = Array.isArray(preference.dashboardSectionOrder) ? sanitizeOrder(preference.dashboardSectionOrder.filter((value): value is string => typeof value === "string")) : null;
  return { onboardingStep: typeof preference.onboardingStep === "number" ? preference.onboardingStep : 0, onboardingCompletedAt: preference.onboardingCompletedAt?.toISOString() ?? null, onboardingSkippedAt: preference.onboardingSkippedAt?.toISOString() ?? null, dashboardSectionOrder: order, hideFinancialValues: preference.hideFinancialValues ?? false, dismissedNewsBannerAt: preference.dismissedNewsBannerAt?.toISOString() ?? null };
}

export async function getUserUiPreference(userId: string): Promise<UserUiPreferenceView> {
  const preference = await prisma.userUiPreference.findUnique({ where: { userId } });
  return preference ? toView(preference) : DEFAULTS;
}

export async function updateUserUiPreference(userId: string, operation: UserUiPreferenceOperation): Promise<UserUiPreferenceView> {
  const now = new Date();
  let update: Prisma.UserUiPreferenceUncheckedUpdateInput;
  let create: Prisma.UserUiPreferenceUncheckedCreateInput;
  if (operation.operation === "advance_onboarding") { const onboardingStep = Math.max(0, Math.min(MAX_ONBOARDING_STEP, Math.trunc(operation.step))); update = { onboardingStep }; create = { userId, onboardingStep }; }
  else if (operation.operation === "skip_onboarding") { update = { onboardingSkippedAt: now }; create = { userId, onboardingSkippedAt: now }; }
  else if (operation.operation === "restart_onboarding") { update = { onboardingStep: 0, onboardingCompletedAt: null, onboardingSkippedAt: null }; create = { userId, onboardingStep: 0 }; }
  else if (operation.operation === "complete_onboarding") { update = { onboardingStep: MAX_ONBOARDING_STEP, onboardingCompletedAt: now, onboardingSkippedAt: null }; create = { userId, onboardingStep: MAX_ONBOARDING_STEP, onboardingCompletedAt: now }; }
  else if (operation.operation === "set_financial_visibility") { update = { hideFinancialValues: operation.hidden }; create = { userId, hideFinancialValues: operation.hidden }; }
  else if (operation.operation === "dismiss_news_banner") { update = { dismissedNewsBannerAt: now }; create = { userId, dismissedNewsBannerAt: now }; }
  else { const dashboardSectionOrder = sanitizeOrder(operation.sectionKeys); update = { dashboardSectionOrder }; create = { userId, dashboardSectionOrder }; }

  const preference = await prisma.userUiPreference.upsert({ where: { userId }, create, update });
  return toView(preference);
}
