import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsPage } from "@/components/settings/settings-page";
import { OnboardingTour } from "@/components/onboardingTour";

const replaceMock = vi.hoisted(() => vi.fn());
const navigationState = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/configuracoes",
  useSearchParams: () => new URLSearchParams(navigationState.query),
}));

describe("SettingsPage", () => {
  const renderSettings = (query = "") => {
    navigationState.query = query;
    return render(
      <OnboardingTour.Provider initialStep={0} initiallyOpen={false}>
        <SettingsPage userName="Gui" userEmail="gui@example.com" />
      </OnboardingTour.Provider>,
    );
  };

  it("navigates sections and reveals optional clinic fields without requiring specialty", () => {
    const first = renderSettings();
    expect(screen.getByLabelText("Especialidade")).not.toBeRequired();
    first.unmount();
    renderSettings("tab=contato");
    expect(
      screen.getByRole("tab", { name: "Contato e endereço" }),
    ).toHaveAttribute("data-state", "active");
    fireEvent.click(screen.getByText(/Dados da clínica\/consultório/));
    expect(screen.getByLabelText("CNPJ")).toBeInTheDocument();
  });

  it("keeps plan drafts transient and explains unavailable saves", () => {
    renderSettings("tab=planos");
    fireEvent.change(screen.getByLabelText("Nome do plano"), {
      target: { value: "Plano mensal" },
    });
    fireEvent.change(screen.getByLabelText("Valor mensal (R$)"), {
      target: { value: "500,00" },
    });
    expect(screen.getByDisplayValue("Plano mensal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar plano" }));
    expect(
      screen.getByRole("dialog", { name: "Salvamento ainda indisponível" }),
    ).toBeInTheDocument();
  });

  it("validates plans and message placeholders before showing unavailable saves", () => {
    const first = renderSettings("tab=planos");
    fireEvent.change(screen.getByLabelText("Nome do plano"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar plano" }));
    expect(screen.getByText("Revise o plano")).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Salvamento ainda indisponível" }),
    ).not.toBeInTheDocument();
    first.unmount();

    renderSettings("tab=mensagens");
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    fireEvent.change(screen.getByLabelText("Texto do template"), {
      target: { value: "Olá {{senha}}" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar template" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Etiqueta desconhecida: senha",
    );
  });

  it("does not fake security preference toggles", () => {
    renderSettings("tab=seguranca");
    const whatsappSwitch = screen.getByRole("switch", { name: /WhatsApp/ });
    fireEvent.click(whatsappSwitch);
    expect(
      screen.getByRole("dialog", {
        name: "Preferências de comunicação em preparação",
      }),
    ).toBeInTheDocument();
    expect(whatsappSwitch).toBeChecked();
  });
});
