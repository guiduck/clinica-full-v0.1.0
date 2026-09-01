"use client";

import * as React from "react";
import {
  ONBOARDING_ADVANCE,
  ONBOARDING_PLACEMENT,
  ONBOARDING_STEPS,
} from "@/constants/onboarding-tour";
import { useOnboardingTourActions } from "@/hooks/onboarding/use-onboarding-tour-actions";
import { useOnboardingTarget } from "@/hooks/onboarding/use-onboarding-target";
import type {
  OnboardingTourContextValue,
  OnboardingTourProps,
} from "@/types/onboarding-tour";
import {
  chooseOnboardingPlacement,
  getOnboardingArrowStyle,
  getOnboardingCardStyle,
  getOnboardingClipPath,
} from "@/utils/onboarding-tour/geometry";
import { OnboardingTourActions } from "./onboarding-tour-actions";
import {
  OnboardingTourArrow,
  OnboardingTourCard,
  OnboardingTourHeader,
  OnboardingTourHints,
  OnboardingTourProgress,
} from "./onboarding-tour-card";
import { OnboardingTourRoot } from "./onboarding-tour-context";
import {
  OnboardingTourBackdrop,
  OnboardingTourSpotlight,
} from "./onboarding-tour-layer";
import {
  OnboardingTourProvider,
  useOnboardingTourStore,
} from "./onboarding-tour-provider";

function OnboardingTourComponent({
  userName,
  canAdvance = true,
}: OnboardingTourProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const open = useOnboardingTourStore((state) => state.open);
  const step = useOnboardingTourStore((state) => state.step);
  const target = useOnboardingTourStore((state) => state.target);
  const cardWidth = useOnboardingTourStore((state) => state.cardWidth);
  const cardHeight = useOnboardingTourStore((state) => state.cardHeight);
  const stepValid = useOnboardingTourStore((state) => state.stepValid);
  const viewport = useOnboardingTourStore((state) => state.viewport);
  const setTarget = useOnboardingTourStore((state) => state.setTarget);
  const setCardSize = useOnboardingTourStore((state) => state.setCardSize);
  const setViewport = useOnboardingTourStore((state) => state.setViewport);
  const actions = useOnboardingTourActions();
  const current = ONBOARDING_STEPS[step];

  useOnboardingTarget({
    cardRef,
    open,
    targetIds: current.targetIds,
    onCardSizeChange: setCardSize,
    onTargetChange: setTarget,
    onViewportChange: setViewport,
  });

  if (!open) return null;

  const preferredPlacement = current.placement ?? ONBOARDING_PLACEMENT.BOTTOM;
  const placement = chooseOnboardingPlacement(
    preferredPlacement,
    target,
    cardHeight,
    viewport,
  );
  const mayAdvance = canAdvance && stepValid;
  const showNextButton =
    !current.advance || current.advance === ONBOARDING_ADVANCE.NEXT;
  const showClickHint = Boolean(
    current.advance && current.advance !== ONBOARDING_ADVANCE.NEXT,
  );
  const lastStep = step === ONBOARDING_STEPS.length - 1;
  const firstName = userName.split(" ")[0] || "por aqui";
  const cardStyle = {
    ...getOnboardingCardStyle(
      placement,
      target,
      cardWidth,
      cardHeight,
      viewport,
    ),
    opacity: viewport.width > 0 ? 1 : 0,
  };

  const context: OnboardingTourContextValue = {
    actions: {
      back: actions.back,
      next: () => actions.next(mayAdvance),
      skip: actions.skip,
    },
    view: {
      cardRef,
      arrowStyle: getOnboardingArrowStyle(
        placement,
        target,
        cardStyle,
        cardWidth,
        cardHeight,
      ),
      cardStyle,
      clipPath: getOnboardingClipPath(target),
      current,
      description: current.description,
      isPending: actions.isPending,
      mayAdvance,
      nextLabel: lastStep ? "Concluir" : "Próximo",
      placement,
      progress: ((step + 1) / ONBOARDING_STEPS.length) * 100,
      showBlockedHint: !mayAdvance,
      showClickHint,
      showNextButton,
      step,
      target,
      title: current.title.replace("{userName}", firstName),
      totalSteps: ONBOARDING_STEPS.length,
      viewport,
    },
  };

  return (
    <OnboardingTourRoot value={context}>
      <OnboardingTourBackdrop />
      <OnboardingTourSpotlight />
      <OnboardingTourCard>
        <OnboardingTourArrow />
        <div
          key={step}
          className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
        >
          <OnboardingTourHeader />
          <OnboardingTourProgress />
          <OnboardingTourHints />
          <OnboardingTourActions />
        </div>
      </OnboardingTourCard>
    </OnboardingTourRoot>
  );
}

export const OnboardingTour = Object.assign(OnboardingTourComponent, {
  Actions: OnboardingTourActions,
  Arrow: OnboardingTourArrow,
  Backdrop: OnboardingTourBackdrop,
  Card: OnboardingTourCard,
  Header: OnboardingTourHeader,
  Hints: OnboardingTourHints,
  Progress: OnboardingTourProgress,
  Provider: OnboardingTourProvider,
  Root: OnboardingTourRoot,
  Spotlight: OnboardingTourSpotlight,
});

export {
  OnboardingTourProvider,
  useOnboardingTourStore,
} from "./onboarding-tour-provider";
