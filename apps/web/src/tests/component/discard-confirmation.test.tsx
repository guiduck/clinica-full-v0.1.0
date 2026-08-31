import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DiscardConfirmation } from "@/components/feedback/discard-confirmation";
import { useDiscardConfirmation } from "@/hooks/use-discard-confirmation";

function Harness({ dirty, onDiscard }: { dirty: boolean; onDiscard: () => void }) {
  const discard = useDiscardConfirmation(dirty);
  return <><button onClick={() => discard.requestDiscard(onDiscard)}>Sair</button><DiscardConfirmation open={discard.open} onCancel={discard.cancelDiscard} onConfirm={discard.confirmDiscard} /></>;
}

describe("DiscardConfirmation", () => {
  it("keeps editing when cancelled", () => { const cancel=vi.fn(); render(<DiscardConfirmation open onCancel={cancel} onConfirm={vi.fn()} />); fireEvent.click(screen.getByRole("button", { name: "Continuar editando" })); expect(cancel).toHaveBeenCalledOnce(); });
  it("executes the pending discard only after confirmation", () => { const confirm=vi.fn(); render(<DiscardConfirmation open onCancel={vi.fn()} onConfirm={confirm} />); fireEvent.click(screen.getByRole("button", { name: "Descartar e sair" })); expect(confirm).toHaveBeenCalledOnce(); });

  it("leaves an empty draft immediately", () => { const discard=vi.fn(); render(<Harness dirty={false} onDiscard={discard} />); fireEvent.click(screen.getByRole("button", { name: "Sair" })); expect(discard).toHaveBeenCalledOnce(); expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); });

  it("protects meaningful content until explicit confirmation", () => { const discard=vi.fn(); render(<Harness dirty onDiscard={discard} />); fireEvent.click(screen.getByRole("button", { name: "Sair" })); expect(discard).not.toHaveBeenCalled(); fireEvent.click(screen.getByRole("button", { name: "Continuar editando" })); expect(discard).not.toHaveBeenCalled(); fireEvent.click(screen.getByRole("button", { name: "Sair" })); fireEvent.click(screen.getByRole("button", { name: "Descartar e sair" })); expect(discard).toHaveBeenCalledOnce(); });
});
