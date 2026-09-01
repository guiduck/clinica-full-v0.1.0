import { createStore } from "zustand/vanilla";
import { ONBOARDING_LAYOUT } from "@/constants/onboarding-tour";
import type {
  OnboardingTourInitialState,
  OnboardingTourStore,
} from "@/types/onboarding-tour";
import {
  boundOnboardingStep,
  getOnboardingShellState,
  isOnboardingStepInitiallyValid,
} from "@/utils/onboarding-tour/step-state";

export function createOnboardingTourStore({
  initialStep = 0,
  initiallyOpen = false,
}: OnboardingTourInitialState = {}) {
  const step = boundOnboardingStep(initialStep);
  const shellState = getOnboardingShellState(step, initiallyOpen);

  return createStore<OnboardingTourStore>()((set) => ({
    open: initiallyOpen,
    step,
    target: null,
    cardWidth: ONBOARDING_LAYOUT.cardWidth,
    cardHeight: ONBOARDING_LAYOUT.defaultCardHeight,
    stepValid: isOnboardingStepInitiallyValid(step),
    viewport: { width: 0, height: 0 },
    ...shellState,
    moveTo(nextStep) {
      const boundedStep = boundOnboardingStep(nextStep);
      set((state) => ({
        step: boundedStep,
        stepValid: isOnboardingStepInitiallyValid(boundedStep),
        ...getOnboardingShellState(boundedStep, state.open),
      }));
      return boundedStep;
    },
    restart() {
      set({
        open: true,
        step: 0,
        target: null,
        stepValid: true,
        ...getOnboardingShellState(0, true),
      });
    },
    close() {
      set({
        open: false,
        target: null,
        ...getOnboardingShellState(step, false),
      });
    },
    setTarget(target) {
      set({ target });
    },
    setCardSize({ width: cardWidth, height: cardHeight }) {
      set({ cardWidth, cardHeight });
    },
    setStepValid(stepValid) {
      set({ stepValid });
    },
    setNavigationOpen(navigationOpen) {
      set({ navigationOpen });
    },
    setUserMenuOpen(userMenuOpen) {
      set({ userMenuOpen });
    },
    setViewport(viewport) {
      set({ viewport });
    },
  }));
}

export type OnboardingTourStoreApi = ReturnType<
  typeof createOnboardingTourStore
>;
