import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppNavigation } from "@/components/app-shell/app-navigation";
import { OnboardingTour } from "@/components/app-shell/onboarding-tour";
import { AppHeader } from "@/components/app-shell/app-header";

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

  it("uses the prototype rail and opens an overlaid shadcn Sheet without a WhatsApp nav item", async () => {
    render(
      <AppNavigation open={false} onOpenChange={vi.fn()} tourActive={false} />,
    );
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "id",
      "tour-sidebar-toggle",
    );
    expect(
      screen.queryByRole("link", { name: "WhatsApp" }),
    ).not.toBeInTheDocument();
  });

  it("reads ?onboarding=<step>, cuts a click-through spotlight and positions the explanation beside its target", async () => {
    const target = document.createElement("button");
    target.id = "tour-user-menu";
    document.body.appendChild(target);
    mockRect(target, { top: 48, left: 1270, width: 130, height: 44 });
    window.history.replaceState({}, "", "/dashboard?onboarding=8");

    render(
      <OnboardingTour initialStep={0} initiallyOpen userName="Mariana Lopes" />,
    );

    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Passo 8 de 16",
    );
    await waitFor(() =>
      expect(screen.getByTestId("onboarding-dim-layer")).toHaveStyle({
        pointerEvents: "none",
      }),
    );
    expect(
      screen.getByTestId("onboarding-dim-layer").getAttribute("style"),
    ).toContain("clip-path");
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-placement",
      "left",
    );
    target.remove();
  });

  it("advances only when the highlighted menu trigger is clicked and keeps query plus server preference synchronized", async () => {
    const target = document.createElement("button");
    target.id = "tour-sidebar-toggle";
    document.body.appendChild(target);
    mockRect(target, { top: 60, left: 8, width: 44, height: 44 });
    window.history.replaceState({}, "", "/dashboard?onboarding=4");
    render(<OnboardingTour initialStep={0} initiallyOpen userName="Mariana" />);

    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Passo 4 de 16",
    );
    fireEvent.click(document.body);
    expect(screen.getByRole("dialog")).toHaveTextContent("Passo 4 de 16");
    fireEvent.click(target);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(180);
    });
    expect(screen.getByRole("dialog")).toHaveTextContent("Passo 5 de 16");
    expect(window.location.search).toBe("?tourStep=5");
    expect(preferenceActionMock).toHaveBeenCalledWith({
      operation: "advance_onboarding",
      step: 4,
    });
    target.remove();
  });

  it("uses shell events to open the account menu, advance to Configurações and retain the current step", async () => {
    const trigger = document.createElement("button");
    trigger.id = "tour-user-menu";
    document.body.appendChild(trigger);
    mockRect(trigger, { top: 48, left: 1260, width: 140, height: 44 });
    window.history.replaceState({}, "", "/dashboard?onboarding=8");
    render(<OnboardingTour initialStep={0} initiallyOpen userName="Mariana" />);

    await screen.findByText("Abra o menu da sua conta");
    act(() => window.dispatchEvent(new CustomEvent("tour:user-menu-opened")));
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveTextContent("Passo 9 de 16"),
    );
    expect(window.location.search).toBe("?tourStep=9");

    act(() => window.dispatchEvent(new CustomEvent("tour:settings-selected")));
    await waitFor(() =>
      expect(preferenceActionMock).toHaveBeenCalledWith({
        operation: "advance_onboarding",
        step: 9,
      }),
    );
    expect(window.location.search).toBe("?tourStep=9");
    trigger.remove();
  });

  it("opens real shell menus and routes Settings with the active onboarding step", async () => {
    const setUserMenuOpen = vi.fn();
    render(
      <AppHeader
        userName="Mariana Lopes"
        shell={{ notifications: [], pendingMessageCount: 0 }}
        userMenuOpen
        onUserMenuOpenChange={setUserMenuOpen}
        onNavigationOpenChange={vi.fn()}
        tourActive
        onboardingStep={8}
      />,
    );
    const settings = screen.getByRole("menuitem", { name: "Configurações" });
    fireEvent.click(settings);
    expect(pushMock).toHaveBeenCalledWith("/configuracoes?tourStep=10");
  });
});
