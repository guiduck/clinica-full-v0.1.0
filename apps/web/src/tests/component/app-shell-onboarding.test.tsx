import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader, AppNavigation } from "@/components/appShell";
import { OnboardingTour } from "@/components/onboardingTour";
import { Tooltip } from "@/components/tooltip";
import { ONBOARDING_ADVANCE } from "@/constants/onboarding-tour";
import { useOnboardingTourActions } from "@/hooks/onboarding/use-onboarding-tour-actions";

const preferenceActionMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true }),
);
const pushMock = vi.hoisted(() => vi.fn());
const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));
vi.mock("@/actions/ui-preferences", () => ({
  updateUserUiPreferenceAction: preferenceActionMock,
}));
vi.mock("@/actions/auth", () => ({
  logoutFromClient: vi.fn().mockResolvedValue({ ok: true }),
}));

function mockRect(element: HTMLElement, rect: Partial<DOMRect>) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    top: rect.top ?? 0,
    left: rect.left ?? 0,
    right: rect.right ?? (rect.left ?? 0) + (rect.width ?? 0),
    bottom: rect.bottom ?? (rect.top ?? 0) + (rect.height ?? 0),
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    toJSON: () => ({}),
  });
}

function renderWithShellState(
  children: React.ReactNode,
  options: { initialStep?: number; initiallyOpen?: boolean } = {},
) {
  return render(
    <OnboardingTour.Provider
      initialStep={options.initialStep}
      initiallyOpen={options.initiallyOpen}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
    </OnboardingTour.Provider>,
  );
}

function TourInteraction({
  interaction,
  targetId,
}: {
  interaction: Parameters<
    ReturnType<typeof useOnboardingTourActions>["advanceFrom"]
  >[0];
  targetId: string;
}) {
  const { advanceFrom, openNavigation } = useOnboardingTourActions();

  function handleClick() {
    if (interaction === ONBOARDING_ADVANCE.CLICK_TARGET) {
      openNavigation();
      return;
    }
    advanceFrom(interaction);
  }

  return <button id={targetId} onClick={handleClick}>Interagir</button>;
}

describe("app shell and guided onboarding", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    preferenceActionMock.mockClear();
    pushMock.mockClear();
    replaceMock.mockClear();
    window.history.replaceState({}, "", "/dashboard");
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1440,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 900,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("uses the prototype rail and opens an overlaid Sheet without a WhatsApp nav item", () => {
    renderWithShellState(<AppNavigation />);

    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "id",
      "tour-sidebar-toggle",
    );
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument();
  });

  it("reads the legacy query, cuts a click-through spotlight and positions the card", async () => {
    const target = document.createElement("button");
    target.id = "tour-user-menu";
    document.body.appendChild(target);
    mockRect(target, { top: 48, left: 1270, width: 130, height: 44 });
    window.history.replaceState({}, "", "/dashboard?onboarding=8");

    renderWithShellState(<OnboardingTour userName="Mariana Lopes" />, {
      initiallyOpen: true,
    });

    expect(await screen.findByRole("dialog")).toHaveTextContent("Passo 8 de 16");
    await waitFor(() =>
      expect(screen.getByTestId("onboarding-dim-layer")).toHaveStyle({
        pointerEvents: "none",
      }),
    );
    expect(
      screen.getByTestId("onboarding-dim-layer").getAttribute("style"),
    ).toContain("clip-path");
    expect(screen.getByRole("dialog")).toHaveAttribute("data-placement", "left");
    target.remove();
  });

  it("advances through an explicit store action and synchronizes query plus preference", async () => {
    window.history.replaceState({}, "", "/dashboard?onboarding=4");
    renderWithShellState(
      <>
        <TourInteraction
          interaction={ONBOARDING_ADVANCE.CLICK_TARGET}
          targetId="tour-sidebar-toggle"
        />
        <OnboardingTour userName="Mariana" />
      </>,
      { initiallyOpen: true },
    );

    expect(await screen.findByRole("dialog")).toHaveTextContent("Passo 4 de 16");
    fireEvent.click(document.body);
    expect(screen.getByRole("dialog")).toHaveTextContent("Passo 4 de 16");
    fireEvent.click(screen.getByRole("button", { name: "Interagir" }));

    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveTextContent("Passo 5 de 16"),
    );
    expect(window.location.search).toBe("?tourStep=5");
    expect(preferenceActionMock).toHaveBeenCalledWith({
      operation: "advance_onboarding",
      step: 4,
    });
  });

  it("advances the account interaction without global CustomEvents", async () => {
    window.history.replaceState({}, "", "/dashboard?onboarding=8");
    renderWithShellState(
      <>
        <TourInteraction
          interaction={ONBOARDING_ADVANCE.USER_MENU}
          targetId="tour-user-menu"
        />
        <OnboardingTour userName="Mariana" />
      </>,
      { initiallyOpen: true },
    );

    fireEvent.click(screen.getByRole("button", { name: "Interagir" }));
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveTextContent("Passo 9 de 16"),
    );
    expect(window.location.search).toBe("?tourStep=9");
  });

  it("forces the real account menu open on the settings-selection step", () => {
    renderWithShellState(
      <AppHeader
        userName="Mariana Lopes"
        shell={{ notifications: [], pendingMessageCount: 0 }}
      />,
      { initialStep: 8, initiallyOpen: true },
    );

    expect(screen.getByRole("menuitem", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/configuracoes?tourStep=10",
    );
  });

  it("exposes a keyboard-readable progress indicator and blocks an invalid CPF step", async () => {
    window.history.replaceState({}, "", "/configuracoes?tourStep=10");
    renderWithShellState(<OnboardingTour userName="Mariana" />, {
      initiallyOpen: true,
    });

    const progress = await screen.findByRole("progressbar", {
      name: "Progresso do tutorial",
    });
    expect(progress).toHaveAttribute("aria-valuenow", "10");
    expect(screen.getByText("Digite um CPF válido para continuar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Próximo/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
