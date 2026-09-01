import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PatientDocumentsTab } from "@/components/patients/patient-documents-tab";

describe("document draft protection", () => {
  it("does not close a generated document without explicit discard", async () => {
    const onDirtyChange = vi.fn();
    render(<PatientDocumentsTab patientName="Ana Carolina" onDirtyChange={onDirtyChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Atestado/ }));
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
    expect(screen.getByLabelText("Título do documento")).toHaveValue("Atestado");

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.getByText("Descartar conteúdo não salvo?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar editando" }));
    expect(screen.getByLabelText("Título do documento")).toHaveValue("Atestado");

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    fireEvent.click(screen.getByRole("button", { name: "Descartar e sair" }));
    await waitFor(() => expect(screen.queryByLabelText("Título do documento")).not.toBeInTheDocument());
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });
});
