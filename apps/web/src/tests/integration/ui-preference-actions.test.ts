import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.hoisted(() => vi.fn());
const findUniqueMock = vi.hoisted(() => vi.fn());
const upsertMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/require-user", () => ({ requireUser: requireUserMock }));
vi.mock("@/lib/prisma", () => ({ prisma: { userUiPreference: { findUnique: findUniqueMock, upsert: upsertMock } } }));

import { updateUserUiPreferenceAction } from "@/actions/ui-preferences";
import { getUserUiPreference } from "@/services/ui-preferences/ui-preferences";

describe("UI preferences", () => {
  beforeEach(() => { vi.clearAllMocks(); requireUserMock.mockResolvedValue({ id: "user-1" }); upsertMock.mockImplementation(({ create, update }) => Promise.resolve({ id: "pref-1", userId: "user-1", ...create, ...update })); });

  it("returns safe defaults without writing when no preference exists", async () => {
    findUniqueMock.mockResolvedValue(null);
    await expect(getUserUiPreference("user-1")).resolves.toMatchObject({ onboardingStep: 0, hideFinancialValues: false, dashboardSectionOrder: null });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("derives ownership from the session and clamps onboarding steps", async () => {
    const result = await updateUserUiPreferenceAction({ operation: "advance_onboarding", step: 999 });
    expect(result.ok).toBe(true);
    expect(upsertMock.mock.calls[0][0].where).toEqual({ userId: "user-1" });
    expect(upsertMock.mock.calls[0][0].update.onboardingStep).toBeLessThanOrEqual(15);
  });

  it("supports skip, restart, complete, privacy, banner and sanitized section order", async () => {
    for (const input of [
      { operation: "skip_onboarding" }, { operation: "restart_onboarding" }, { operation: "complete_onboarding" },
      { operation: "set_financial_visibility", hidden: true }, { operation: "dismiss_news_banner" },
      { operation: "set_dashboard_order", sectionKeys: ["appointments", "unknown", "appointments", "finance"] }
    ] as const) expect((await updateUserUiPreferenceAction(input)).ok).toBe(true);
    expect(upsertMock.mock.calls.at(-1)?.[0].update.dashboardSectionOrder).toEqual(["appointments", "finance"]);
  });
});
