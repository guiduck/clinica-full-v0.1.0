import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PatientDocumentsTab } from "@/components/patients/patient-documents-tab";

describe("PatientDocumentsTab", () => {
  it("supports template editing and preview but blocks PDF and save", () => {
    render(<PatientDocumentsTab patientName="Ana Teste" />);
    fireEvent.click(screen.getByRole("button", { name: /Atestado/ }));
    expect(
      (screen.getByLabelText("Conteúdo do documento") as HTMLTextAreaElement)
        .value,
    ).toContain("Ana Teste");
    fireEvent.click(screen.getByRole("button", { name: "Pré-visualizar" }));
    expect(
      screen.getByText(/Texto editável conforme o modelo/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "PDF" }));
    expect(
      screen.getByRole("dialog", {
        name: "Repositório de documentos ainda não conectado",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /baixar|download/i }),
    ).not.toBeInTheDocument();
  });

  it("opens upload selection without claiming persistence", () => {
    render(<PatientDocumentsTab patientName="Ana Teste" />);
    const file = new File(["image"], "documento.png", { type: "image/png" });
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });
    expect(
      screen.getByRole("dialog", {
        name: "Repositório de documentos ainda não conectado",
      }),
    ).toBeInTheDocument();
  });

  it("exposes a signature canvas without applying an empty signature", () => {
    render(<PatientDocumentsTab patientName="Ana Teste" />);
    fireEvent.click(screen.getByRole("button", { name: /Contrato/ }));
    fireEvent.click(screen.getByRole("button", { name: "Assinar" }));
    expect(screen.getByLabelText("Área para desenhar assinatura")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aplicar assinatura" })).toBeDisabled();
  });
});
