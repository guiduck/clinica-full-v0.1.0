"use client";

import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingTourContext } from "./onboarding-tour-context";

export function OnboardingTourActions() {
  const { actions, view } = useOnboardingTourContext();
  const backDisabled = view.step === 0 || view.isPending;

  return (
    <footer className="mt-3 flex items-center justify-between gap-2">
      <Button variant="ghost" size="sm" onClick={actions.skip}>
        <SkipForward aria-hidden="true" className="size-4" /> Pular
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={backDisabled}
          onClick={actions.back}
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Voltar
        </Button>
        {view.showNextButton && (
          <Button
            aria-disabled={!view.mayAdvance}
            disabled={view.isPending}
            size="sm"
            onClick={actions.next}
          >
            {view.nextLabel}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>
    </footer>
  );
}
