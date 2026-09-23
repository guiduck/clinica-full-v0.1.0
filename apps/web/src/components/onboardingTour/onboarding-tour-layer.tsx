"use client";

import type { CSSProperties, SyntheticEvent } from "react";
import { useOnboardingTourContext } from "./onboarding-tour-context";

function stopOutsideInteraction(event: SyntheticEvent<HTMLDivElement>) {
  event.preventDefault();
  event.stopPropagation();
}

function OnboardingTourInteractionBlocker({
  className,
  position,
  style,
}: {
  className: string;
  position: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      data-position={position}
      data-testid="onboarding-interaction-blocker"
      className={className}
      style={style}
      onClick={stopOutsideInteraction}
      onContextMenu={stopOutsideInteraction}
      onPointerDown={stopOutsideInteraction}
    />
  );
}

function OnboardingTourBackdropBlockers() {
  const { view } = useOnboardingTourContext();
  const { target, viewport } = view;

  if (!target) {
    return (
      <OnboardingTourInteractionBlocker
        position="viewport"
        className="pointer-events-auto fixed inset-0 z-[105]"
      />
    );
  }

  const top = Math.max(0, target.top);
  const bottom = Math.min(viewport.height, target.bottom);
  const blockerHeight = Math.max(0, bottom - top);

  return (
    <>
      <OnboardingTourInteractionBlocker
        position="top"
        className="pointer-events-auto fixed left-0 right-0 top-0 z-[105]"
        style={{ height: top }}
      />
      <OnboardingTourInteractionBlocker
        position="bottom"
        className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[105]"
        style={{ top: bottom }}
      />
      <OnboardingTourInteractionBlocker
        position="left"
        className="pointer-events-auto fixed left-0 z-[105]"
        style={{ top, width: Math.max(0, target.left), height: blockerHeight }}
      />
      <OnboardingTourInteractionBlocker
        position="right"
        className="pointer-events-auto fixed right-0 z-[105]"
        style={{
          top,
          left: Math.min(viewport.width, target.right),
          height: blockerHeight,
        }}
      />
    </>
  );
}

export function OnboardingTourBackdrop() {
  const { view } = useOnboardingTourContext();

  return (
    <>
      <div
        data-testid="onboarding-dim-layer"
        className="fixed inset-0 z-[100] bg-slate-950/55 transition-[clip-path] duration-300 ease-out motion-reduce:transition-none"
        style={{ clipPath: view.clipPath, pointerEvents: "none" }}
      />
      <OnboardingTourBackdropBlockers />
    </>
  );
}

export function OnboardingTourSpotlight() {
  const { view } = useOnboardingTourContext();
  if (!view.target) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[110] rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background transition-[left,top,width,height] duration-300 ease-out motion-reduce:transition-none"
      style={{
        left: view.target.left,
        top: view.target.top,
        width: view.target.width,
        height: view.target.height,
      }}
    />
  );
}
