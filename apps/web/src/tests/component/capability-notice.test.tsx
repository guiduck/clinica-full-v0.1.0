import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { CAPABILITIES, unavailableCapabilityResult } from "@/components/feedback/capabilities";
import { CapabilityNotice } from "@/components/feedback/capability-notice";

describe("CapabilityNotice", () => {
  it("opens contextual feedback without invoking a mutation and returns focus", async () => {
    const mutation = vi.fn();
    render(<CapabilityNotice descriptor={CAPABILITIES.passwordRecovery} trigger={<Button onClick={() => undefined}>Recuperar senha</Button>} />);
    const trigger = screen.getByRole("button", { name: "Recuperar senha" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toHaveTextContent("Nenhum link foi enviado");
    expect(mutation).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("returns the payload-free standard result", () => {
    expect(unavailableCapabilityResult(CAPABILITIES.googleLogin)).toEqual({ title: CAPABILITIES.googleLogin.title, description: CAPABILITIES.googleLogin.message, capabilityKey: "auth.google-login", availableNow: false, mutationPerformed: false });
  });
});
