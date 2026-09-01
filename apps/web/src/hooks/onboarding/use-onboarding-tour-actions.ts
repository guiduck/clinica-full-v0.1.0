"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateUserUiPreferenceAction } from "@/actions/ui-preferences";
import {
  ONBOARDING_ADVANCE,
  ONBOARDING_STEPS,
} from "@/constants/onboarding-tour";
import { useOnboardingTourStoreApi } from "@/components/onboardingTour/onboarding-tour-provider";
import type { OnboardingAdvance } from "@/types/onboarding-tour";
import { writeOnboardingStepToQuery } from "@/utils/onboarding-tour/query-state";

type UiPreferenceOperation = Parameters<
  typeof updateUserUiPreferenceAction
>[0];

export function useOnboardingTourActions() {
  const router = useRouter();
  const store = useOnboardingTourStoreApi();
  const [isPending, startTransition] = React.useTransition();

  const persist = React.useCallback((operation: UiPreferenceOperation) => {
    startTransition(() => {
      void updateUserUiPreferenceAction(operation);
    });
  }, []);

  const moveTo = React.useCallback(
    (nextStep: number) => {
      const step = store.getState().moveTo(nextStep);
      writeOnboardingStepToQuery(step);
      persist({ operation: "advance_onboarding", step });
      return step;
    },
    [persist, store],
  );

  const advanceFrom = React.useCallback(
    (interaction: OnboardingAdvance) => {
      const state = store.getState();
      if (!state.open) return false;

      const current = ONBOARDING_STEPS[state.step];
      if (current.advance !== interaction) return false;

      moveTo(state.step + 1);
      return true;
    },
    [moveTo, store],
  );

  const finish = React.useCallback(() => {
    persist({ operation: "complete_onboarding" });
    writeOnboardingStepToQuery(null);
    store.getState().close();
    router.push("/dashboard");
  }, [persist, router, store]);

  const skip = React.useCallback(() => {
    persist({ operation: "skip_onboarding" });
    writeOnboardingStepToQuery(null);
    store.getState().close();
  }, [persist, store]);

  const next = React.useCallback(
    (mayAdvance: boolean) => {
      if (!mayAdvance) return;

      const step = store.getState().step;
      const lastStep = step === ONBOARDING_STEPS.length - 1;
      if (lastStep) {
        finish();
        return;
      }

      moveTo(step + 1);
    },
    [finish, moveTo, store],
  );

  const back = React.useCallback(() => {
    moveTo(store.getState().step - 1);
  }, [moveTo, store]);

  const restart = React.useCallback(async () => {
    await updateUserUiPreferenceAction({ operation: "restart_onboarding" });
    store.getState().restart();
    writeOnboardingStepToQuery(0);
    router.push("/dashboard?tourStep=1");
  }, [router, store]);

  const openNavigation = React.useCallback(() => {
    store.getState().setNavigationOpen(true);
    advanceFrom(ONBOARDING_ADVANCE.CLICK_TARGET);
  }, [advanceFrom, store]);

  return {
    advanceFrom,
    back,
    isPending,
    next,
    openNavigation,
    restart,
    skip,
  } as const;
}
