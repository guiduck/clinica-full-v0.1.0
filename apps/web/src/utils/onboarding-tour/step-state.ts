import {
  ONBOARDING_CPF_STEP_INDEX,
  ONBOARDING_SHELL_STATE,
  ONBOARDING_STEPS,
} from "@/constants/onboarding-tour";

export function boundOnboardingStep(step: number): number {
  return Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, step));
}

export function getOnboardingShellState(step: number, open: boolean) {
  if (!open) {
    return { navigationOpen: false, userMenuOpen: false } as const;
  }

  const shellState = ONBOARDING_STEPS[boundOnboardingStep(step)].shellState;
  if (shellState === ONBOARDING_SHELL_STATE.NAVIGATION_OPEN) {
    return { navigationOpen: true, userMenuOpen: false } as const;
  }

  if (shellState === ONBOARDING_SHELL_STATE.USER_MENU_OPEN) {
    return { navigationOpen: false, userMenuOpen: true } as const;
  }

  return { navigationOpen: false, userMenuOpen: false } as const;
}

export function isOnboardingStepInitiallyValid(step: number): boolean {
  return boundOnboardingStep(step) !== ONBOARDING_CPF_STEP_INDEX;
}
