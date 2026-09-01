import {
  ONBOARDING_QUERY_KEYS,
  ONBOARDING_STEPS,
} from "@/constants/onboarding-tour";

export function readOnboardingStepFromQuery(search: string): number | null {
  const params = new URLSearchParams(search);
  let rawStep: string | null = null;

  for (const key of ONBOARDING_QUERY_KEYS) {
    rawStep = params.get(key);
    if (rawStep !== null) break;
  }

  const step = Number(rawStep);
  if (!Number.isInteger(step)) return null;
  if (step < 1 || step > ONBOARDING_STEPS.length) return null;

  return step - 1;
}

export function writeOnboardingStepToQuery(step: number | null): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("onboarging");
  url.searchParams.delete("onboarding");

  if (step === null) {
    url.searchParams.delete("tourStep");
  }

  if (step !== null) {
    url.searchParams.set("tourStep", String(step + 1));
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}
