"use client";

import { X } from "lucide-react";
import {
  ONBOARDING_ARROW_CLASS_BY_PLACEMENT,
  ONBOARDING_CLICK_HINT,
  ONBOARDING_DEFAULT_BLOCKED_HINT,
} from "@/constants/onboarding-tour";
import { cn } from "@/lib/utils";
import { useOnboardingTourContext } from "./onboarding-tour-context";

export function OnboardingTourCard({ children }: React.PropsWithChildren) {
  const { actions, view } = useOnboardingTourContext();

  return (
    <div
      ref={view.cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="onboarding-title"
      data-placement={view.placement}
      className="pointer-events-auto fixed z-[120] w-[min(360px,calc(100vw-2rem))] rounded-xl border bg-background p-5 shadow-2xl transition-[left,top,opacity] duration-300 ease-out motion-reduce:transition-none"
      style={view.cardStyle}
    >
      {children}
      <button
        type="button"
        onClick={actions.skip}
        className="absolute right-3 top-3 grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Fechar tutorial"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

export function OnboardingTourArrow() {
  const { view } = useOnboardingTourContext();
  if (view.placement === "center") return null;

  return (
    <span
      aria-hidden="true"
      data-testid="onboarding-arrow"
      className={cn(
        "absolute size-4 rotate-45 border bg-background transition-[left,top] duration-300 ease-out motion-reduce:transition-none",
        ONBOARDING_ARROW_CLASS_BY_PLACEMENT[view.placement],
      )}
      style={view.arrowStyle}
    />
  );
}

export function OnboardingTourHeader() {
  const { view } = useOnboardingTourContext();

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
        Passo {view.step + 1} de {view.totalSteps}
      </p>
      <h2 id="onboarding-title" className="mt-1 text-base font-semibold">
        {view.title}
      </h2>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
        {view.description}
      </p>
    </div>
  );
}

export function OnboardingTourProgress() {
  const { view } = useOnboardingTourContext();

  return (
    <div
      role="progressbar"
      aria-label="Progresso do tutorial"
      aria-valuemin={1}
      aria-valuemax={view.totalSteps}
      aria-valuenow={view.step + 1}
      className="mt-4 h-1 overflow-hidden rounded-full bg-primary/10"
    >
      <span
        className="block h-full bg-primary transition-[width] motion-reduce:transition-none"
        style={{ width: `${view.progress}%` }}
      />
    </div>
  );
}

export function OnboardingTourHints() {
  const { view } = useOnboardingTourContext();
  if (!view.showClickHint && !view.showBlockedHint) return null;

  const blockedHint =
    view.current.blockedHint ?? ONBOARDING_DEFAULT_BLOCKED_HINT;

  return (
    <div aria-live="polite">
      {view.showClickHint && (
        <p className="mt-3 rounded-md bg-muted/70 px-3 py-2 text-xs italic text-muted-foreground">
          {ONBOARDING_CLICK_HINT}
        </p>
      )}
      {view.showBlockedHint && (
        <p className="mt-3 rounded-md bg-muted/70 px-3 py-2 text-xs italic text-muted-foreground">
          {blockedHint}
        </p>
      )}
    </div>
  );
}
