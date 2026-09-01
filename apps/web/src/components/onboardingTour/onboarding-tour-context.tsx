"use client";

import * as React from "react";
import type { OnboardingTourContextValue } from "@/types/onboarding-tour";

const OnboardingTourContext =
  React.createContext<OnboardingTourContextValue | null>(null);

export type OnboardingTourRootProps = React.PropsWithChildren<{
  value: OnboardingTourContextValue;
}>;

export function OnboardingTourRoot({
  children,
  value,
}: OnboardingTourRootProps) {
  return (
    <OnboardingTourContext value={value}>
      <div
        className="pointer-events-none fixed inset-0 z-[100]"
        aria-live="polite"
      >
        {children}
      </div>
    </OnboardingTourContext>
  );
}

export function useOnboardingTourContext(): OnboardingTourContextValue {
  const context = React.use(OnboardingTourContext);
  if (!context) {
    throw new Error(
      "Os subcomponentes de OnboardingTour devem ser usados dentro de OnboardingTour.Root.",
    );
  }
  return context;
}
