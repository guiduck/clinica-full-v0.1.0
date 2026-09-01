import type { CSSProperties } from "react";
import {
  ONBOARDING_LAYOUT,
  ONBOARDING_PLACEMENT,
} from "@/constants/onboarding-tour";
import type {
  OnboardingPlacement,
  OnboardingTargetRect,
  OnboardingViewport,
} from "@/types/onboarding-tour";

const PLACEMENT_FALLBACK_ORDER: readonly OnboardingPlacement[] = [
  ONBOARDING_PLACEMENT.BOTTOM,
  ONBOARDING_PLACEMENT.LEFT,
  ONBOARDING_PLACEMENT.RIGHT,
  ONBOARDING_PLACEMENT.TOP,
];

export function findVisibleTargetRect(
  targetIds: readonly string[] = [],
): OnboardingTargetRect | null {
  const visibleRects = targetIds.flatMap((id) => {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return [];
    return [rect];
  });

  if (visibleRects.length === 0) return null;

  const top =
    Math.min(...visibleRects.map((rect) => rect.top)) -
    ONBOARDING_LAYOUT.targetPadding;
  const left =
    Math.min(...visibleRects.map((rect) => rect.left)) -
    ONBOARDING_LAYOUT.targetPadding;
  const right =
    Math.max(...visibleRects.map((rect) => rect.right)) +
    ONBOARDING_LAYOUT.targetPadding;
  const bottom =
    Math.max(...visibleRects.map((rect) => rect.bottom)) +
    ONBOARDING_LAYOUT.targetPadding;

  return {
    top,
    left,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export function chooseOnboardingPlacement(
  preferred: OnboardingPlacement,
  target: OnboardingTargetRect | null,
  cardHeight: number,
  viewport: OnboardingViewport,
): OnboardingPlacement {
  if (!target || preferred === ONBOARDING_PLACEMENT.CENTER) {
    return ONBOARDING_PLACEMENT.CENTER;
  }

  const targetOutsideViewport =
    target.bottom <= 0 || target.top >= viewport.height;
  if (targetOutsideViewport) return ONBOARDING_PLACEMENT.CENTER;

  const horizontalPlacement =
    preferred === ONBOARDING_PLACEMENT.LEFT ||
    preferred === ONBOARDING_PLACEMENT.RIGHT;
  const narrowViewport = viewport.width < ONBOARDING_LAYOUT.mobileBreakpoint;
  if (narrowViewport && horizontalPlacement) {
    return ONBOARDING_PLACEMENT.CENTER;
  }

  const room = {
    left: target.left,
    right: viewport.width - target.right,
    top: target.top,
    bottom: viewport.height - target.bottom,
  };
  const fits: Record<Exclude<OnboardingPlacement, "center">, boolean> = {
    left: room.left >= ONBOARDING_LAYOUT.cardWidth + ONBOARDING_LAYOUT.gap,
    right: room.right >= ONBOARDING_LAYOUT.cardWidth + ONBOARDING_LAYOUT.gap,
    top: room.top >= cardHeight + ONBOARDING_LAYOUT.gap,
    bottom: room.bottom >= cardHeight + ONBOARDING_LAYOUT.gap,
  };

  if (fits[preferred]) return preferred;

  const fallback = PLACEMENT_FALLBACK_ORDER.find(
    (placement) => placement !== "center" && fits[placement],
  );
  return fallback ?? ONBOARDING_PLACEMENT.CENTER;
}

export function getOnboardingCardStyle(
  placement: OnboardingPlacement,
  target: OnboardingTargetRect | null,
  cardWidth: number,
  cardHeight: number,
  viewport: OnboardingViewport,
): CSSProperties {
  if (placement === ONBOARDING_PLACEMENT.CENTER || !target) {
    return {
      left: Math.max(ONBOARDING_LAYOUT.gap, (viewport.width - cardWidth) / 2),
      top: Math.max(ONBOARDING_LAYOUT.gap, (viewport.height - cardHeight) / 2),
    };
  }

  const constrainedTop = Math.max(
    ONBOARDING_LAYOUT.gap,
    Math.min(target.top, viewport.height - cardHeight - ONBOARDING_LAYOUT.gap),
  );

  if (placement === ONBOARDING_PLACEMENT.LEFT) {
    return {
      left: target.left - ONBOARDING_LAYOUT.gap - cardWidth,
      top: constrainedTop,
    };
  }

  if (placement === ONBOARDING_PLACEMENT.RIGHT) {
    return {
      left: target.right + ONBOARDING_LAYOUT.gap,
      top: constrainedTop,
    };
  }

  const constrainedLeft = Math.max(
    ONBOARDING_LAYOUT.gap,
    Math.min(target.left, viewport.width - cardWidth - ONBOARDING_LAYOUT.gap),
  );

  if (placement === ONBOARDING_PLACEMENT.TOP) {
    return {
      left: constrainedLeft,
      top: target.top - ONBOARDING_LAYOUT.gap - cardHeight,
    };
  }

  return {
    left: constrainedLeft,
    top: target.bottom + ONBOARDING_LAYOUT.gap,
  };
}

export function getOnboardingArrowStyle(
  placement: OnboardingPlacement,
  target: OnboardingTargetRect | null,
  cardStyle: CSSProperties,
  cardWidth: number,
  cardHeight: number,
): CSSProperties | undefined {
  if (placement === ONBOARDING_PLACEMENT.CENTER || !target) return undefined;

  const cardLeft = Number(cardStyle.left);
  const cardTop = Number(cardStyle.top);
  const minimum = ONBOARDING_LAYOUT.arrowInset;

  if (
    placement === ONBOARDING_PLACEMENT.TOP ||
    placement === ONBOARDING_PLACEMENT.BOTTOM
  ) {
    const targetCenter = target.left + target.width / 2;
    const desiredLeft =
      targetCenter - cardLeft - ONBOARDING_LAYOUT.arrowSize / 2;
    const maximum = cardWidth - minimum - ONBOARDING_LAYOUT.arrowSize;
    return { left: Math.max(minimum, Math.min(desiredLeft, maximum)) };
  }

  const targetCenter = target.top + target.height / 2;
  const desiredTop = targetCenter - cardTop - ONBOARDING_LAYOUT.arrowSize / 2;
  const maximum = cardHeight - minimum - ONBOARDING_LAYOUT.arrowSize;
  return { top: Math.max(minimum, Math.min(desiredTop, maximum)) };
}

export function getOnboardingClipPath(
  target: OnboardingTargetRect | null,
): string | undefined {
  if (!target) return undefined;

  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${target.left}px ${target.top}px, ${target.left}px ${target.bottom}px, ${target.right}px ${target.bottom}px, ${target.right}px ${target.top}px, ${target.left}px ${target.top}px)`;
}
