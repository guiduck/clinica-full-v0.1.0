"use client";

import * as React from "react";
import { ONBOARDING_LAYOUT } from "@/constants/onboarding-tour";
import type {
  OnboardingCardSize,
  OnboardingTargetRect,
  OnboardingViewport,
} from "@/types/onboarding-tour";
import { findVisibleTargetRect } from "@/utils/onboarding-tour/geometry";

type UseOnboardingTargetParams = Readonly<{
  cardRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  targetIds?: readonly string[];
  onCardSizeChange: (size: OnboardingCardSize) => void;
  onTargetChange: (target: OnboardingTargetRect | null) => void;
  onViewportChange: (viewport: OnboardingViewport) => void;
}>;

const EMPTY_TARGET_IDS: readonly string[] = [];

function findFirstTarget(targetIds: readonly string[]): HTMLElement | null {
  for (const id of targetIds) {
    const element = document.getElementById(id);
    if (element) return element;
  }
  return null;
}

export function useOnboardingTarget({
  cardRef,
  open,
  targetIds,
  onCardSizeChange,
  onTargetChange,
  onViewportChange,
}: UseOnboardingTargetParams): void {
  const resolvedTargetIds = React.useMemo(
    () => targetIds ?? EMPTY_TARGET_IDS,
    [targetIds],
  );
  const targetKey = resolvedTargetIds.join("|");

  React.useEffect(() => {
    if (!open) return;

    let frame = 0;
    const measure = () => {
      onViewportChange({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      onTargetChange(findVisibleTargetRect(resolvedTargetIds));
      const card = cardRef.current;
      if (card?.offsetWidth && card.offsetHeight) {
        onCardSizeChange({
          width: card.offsetWidth,
          height: card.offsetHeight,
        });
      }
    };
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const target = findFirstTarget(resolvedTargetIds);
    const targetRect = target?.getBoundingClientRect();
    const targetOutsideViewport = Boolean(
      targetRect &&
      (targetRect.top < ONBOARDING_LAYOUT.gap ||
        targetRect.bottom > window.innerHeight - ONBOARDING_LAYOUT.gap),
    );
    if (
      target &&
      targetOutsideViewport &&
      typeof target.scrollIntoView === "function"
    ) {
      target.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "center",
      });
    }

    measure();
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);
    if (target) resizeObserver?.observe(target);
    if (cardRef.current) resizeObserver?.observe(cardRef.current);

    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(scheduleMeasure);
    mutationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [
    cardRef,
    onCardSizeChange,
    onTargetChange,
    onViewportChange,
    open,
    resolvedTargetIds,
    targetKey,
  ]);
}
