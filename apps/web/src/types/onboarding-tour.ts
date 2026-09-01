import type { CSSProperties, RefObject } from "react";

export type OnboardingPlacement =
  "top" | "right" | "bottom" | "left" | "center";

export type OnboardingAdvance =
  | "next"
  | "click-target"
  | "user-menu"
  | "settings-selected"
  | "account-save"
  | "contact-save";

export type OnboardingShellState = "navigation-open" | "user-menu-open";

export type OnboardingStep = Readonly<{
  title: string;
  description: string;
  targetIds?: readonly string[];
  placement?: OnboardingPlacement;
  advance?: OnboardingAdvance;
  shellState?: OnboardingShellState;
  blockedHint?: string;
}>;

export type OnboardingTargetRect = Readonly<{
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}>;

export type OnboardingViewport = Readonly<{
  width: number;
  height: number;
}>;

export type OnboardingCardSize = Readonly<{
  width: number;
  height: number;
}>;

export type OnboardingTourInitialState = Readonly<{
  initialStep?: number;
  initiallyOpen?: boolean;
}>;

export type OnboardingTourState = Readonly<{
  open: boolean;
  step: number;
  target: OnboardingTargetRect | null;
  cardWidth: number;
  cardHeight: number;
  stepValid: boolean;
  navigationOpen: boolean;
  userMenuOpen: boolean;
  viewport: OnboardingViewport;
}>;

export type OnboardingTourActions = Readonly<{
  moveTo: (step: number) => number;
  restart: () => void;
  close: () => void;
  setTarget: (target: OnboardingTargetRect | null) => void;
  setCardSize: (size: OnboardingCardSize) => void;
  setStepValid: (valid: boolean) => void;
  setNavigationOpen: (open: boolean) => void;
  setUserMenuOpen: (open: boolean) => void;
  setViewport: (viewport: OnboardingViewport) => void;
}>;

export type OnboardingTourStore = OnboardingTourState & OnboardingTourActions;

export type OnboardingTourProps = Readonly<{
  userName: string;
  canAdvance?: boolean;
}>;

export type OnboardingTourView = Readonly<{
  cardRef: RefObject<HTMLDivElement | null>;
  arrowStyle?: CSSProperties;
  cardStyle: CSSProperties;
  clipPath?: string;
  current: OnboardingStep;
  description: string;
  isPending: boolean;
  mayAdvance: boolean;
  nextLabel: string;
  placement: OnboardingPlacement;
  progress: number;
  showBlockedHint: boolean;
  showClickHint: boolean;
  showNextButton: boolean;
  step: number;
  target: OnboardingTargetRect | null;
  title: string;
  totalSteps: number;
  viewport: OnboardingViewport;
}>;

export type OnboardingTourViewActions = Readonly<{
  back: () => void;
  next: () => void;
  skip: () => void;
}>;

export type OnboardingTourContextValue = Readonly<{
  actions: OnboardingTourViewActions;
  view: OnboardingTourView;
}>;
