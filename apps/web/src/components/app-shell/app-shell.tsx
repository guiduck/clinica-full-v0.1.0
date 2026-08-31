"use client";
import * as React from "react";
import { AppHeader } from "./app-header";
import { AppNavigation } from "./app-navigation";
import { OnboardingTour } from "./onboarding-tour";
import type { AppShellView } from "@/types/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
export function AppShell({
  children,
  userName,
  shell,
  initialStep,
  initiallyOpen,
}: Readonly<{
  children: React.ReactNode;
  userName: string;
  shell: AppShellView;
  initialStep: number;
  initiallyOpen: boolean;
}>) {
  const [navigationOpen, setNavigationOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [step, setStep] = React.useState(initialStep);
  const [tourActive, setTourActive] = React.useState(initiallyOpen);
  React.useEffect(() => {
    const nav = () => setNavigationOpen(true),
      closeNav = () => setNavigationOpen(false),
      user = () => setUserMenuOpen(true),
      closeUser = () => setUserMenuOpen(false),
      sync = () => {
        const n = Number(
          new URLSearchParams(location.search).get("tourStep") ??
            new URLSearchParams(location.search).get("onboarding"),
        );
        if (Number.isInteger(n)) setStep(n - 1);
      },
      activate = () => setTourActive(true),
      deactivate = () => setTourActive(false);
    window.addEventListener("tour:navigation-open", nav);
    window.addEventListener("tour:navigation-close", closeNav);
    window.addEventListener("tour:user-menu-force-open", user);
    window.addEventListener("tour:user-menu-force-close", closeUser);
    window.addEventListener("tour:user-menu-opened", sync);
    window.addEventListener("tour:settings-selected", sync);
    window.addEventListener("onboarding:active", activate);
    window.addEventListener("onboarding:inactive", deactivate);
    return () => {
      window.removeEventListener("tour:navigation-open", nav);
      window.removeEventListener("tour:navigation-close", closeNav);
      window.removeEventListener("tour:user-menu-force-open", user);
      window.removeEventListener("tour:user-menu-force-close", closeUser);
      window.removeEventListener("tour:user-menu-opened", sync);
      window.removeEventListener("tour:settings-selected", sync);
      window.removeEventListener("onboarding:active", activate);
      window.removeEventListener("onboarding:inactive", deactivate);
    };
  }, []);
  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background">
      <AppNavigation
        open={navigationOpen}
        onOpenChange={setNavigationOpen}
        tourActive={tourActive}
      />
      <AppHeader
        userName={userName}
        shell={shell}
        userMenuOpen={userMenuOpen}
        onUserMenuOpenChange={setUserMenuOpen}
        onNavigationOpenChange={setNavigationOpen}
        tourActive={tourActive}
        onboardingStep={step}
      />
      <main className="min-w-0 pb-16 lg:ml-14 lg:pb-0">{children}</main>
      <OnboardingTour
        initialStep={initialStep}
        initiallyOpen={initiallyOpen}
        userName={userName}
      />
    </div>
    </TooltipProvider>
  );
}
