"use client";

import * as React from "react";
import { useStore } from "zustand";
import {
  createOnboardingTourStore,
  type OnboardingTourStoreApi,
} from "@/stores/onboarding-tour-store";
import type {
  OnboardingTourInitialState,
  OnboardingTourStore,
} from "@/types/onboarding-tour";
import { readOnboardingStepFromQuery } from "@/utils/onboarding-tour/query-state";

const OnboardingTourStoreContext =
  React.createContext<OnboardingTourStoreApi | null>(null);

type OnboardingTourProviderProps = React.PropsWithChildren<
  OnboardingTourInitialState
>;

export function OnboardingTourProvider({
  children,
  initialStep = 0,
  initiallyOpen = false,
}: OnboardingTourProviderProps) {
  const storeRef = React.useRef<OnboardingTourStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createOnboardingTourStore({
      initialStep,
      initiallyOpen,
    });
  }

  React.useEffect(() => {
    const queryStep = readOnboardingStepFromQuery(window.location.search);
    if (queryStep === null) return;
    storeRef.current?.getState().moveTo(queryStep);
  }, []);

  return (
    <OnboardingTourStoreContext value={storeRef.current}>
      {children}
    </OnboardingTourStoreContext>
  );
}

export function useOnboardingTourStoreApi(): OnboardingTourStoreApi {
  const store = React.use(OnboardingTourStoreContext);
  if (!store) {
    throw new Error(
      "useOnboardingTourStoreApi deve ser usado dentro de OnboardingTour.Provider.",
    );
  }
  return store;
}

export function useOnboardingTourStore<T>(
  selector: (state: OnboardingTourStore) => T,
): T {
  const store = useOnboardingTourStoreApi();
  return useStore(store, selector);
}
