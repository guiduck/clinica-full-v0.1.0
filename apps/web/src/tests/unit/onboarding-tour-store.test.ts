import { describe, expect, it } from "vitest";
import { createOnboardingTourStore } from "@/stores/onboarding-tour-store";

describe("onboarding tour store", () => {
  it("keeps shell state and tour step in a single source of truth", () => {
    const store = createOnboardingTourStore({
      initialStep: 4,
      initiallyOpen: true,
    });

    expect(store.getState()).toMatchObject({
      step: 4,
      navigationOpen: true,
      userMenuOpen: false,
      viewport: { width: 0, height: 0 },
    });

    store.getState().moveTo(8);
    expect(store.getState()).toMatchObject({
      step: 8,
      navigationOpen: false,
      userMenuOpen: true,
    });
  });

  it("starts the CPF step blocked and resets on restart", () => {
    const store = createOnboardingTourStore({
      initialStep: 9,
      initiallyOpen: true,
    });

    expect(store.getState().stepValid).toBe(false);
    store.getState().setStepValid(true);
    expect(store.getState().stepValid).toBe(true);
    store.getState().restart();
    expect(store.getState()).toMatchObject({
      open: true,
      step: 0,
      stepValid: true,
    });
  });
});
