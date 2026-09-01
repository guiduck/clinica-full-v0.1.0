"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutFromClient } from "@/actions/auth";
import { useOnboardingTourStore } from "@/components/onboardingTour";
import { useOnboardingTourActions } from "@/hooks/onboarding/use-onboarding-tour-actions";
import { BottomNavigation } from "./bottom-navigation";
import { NavigationRail } from "./navigation-rail";
import { NavigationSheet } from "./navigation-sheet";

export function AppNavigation() {
  const path = usePathname();
  const router = useRouter();
  const [financeOpen, setFinanceOpen] = React.useState(false);
  const open = useOnboardingTourStore((state) => state.navigationOpen);
  const setOpen = useOnboardingTourStore((state) => state.setNavigationOpen);
  const tourActive = useOnboardingTourStore((state) => state.open);
  const { openNavigation } = useOnboardingTourActions();

  async function signOut() {
    await logoutFromClient();
    router.replace("/login");
  }

  return (
    <>
      <NavigationRail
        financeOpen={financeOpen}
        path={path}
        onFinanceOpenChange={setFinanceOpen}
        onNavigationOpen={openNavigation}
        onSignOut={() => void signOut()}
      />
      <NavigationSheet
        open={open}
        path={path}
        tourActive={tourActive}
        onOpenChange={setOpen}
        onSignOut={() => void signOut()}
      />
      <BottomNavigation path={path} />
    </>
  );
}
