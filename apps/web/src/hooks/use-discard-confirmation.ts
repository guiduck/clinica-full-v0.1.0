"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useDiscardConfirmation(hasMeaningfulContent: boolean) {
  const [open, setOpen] = useState(false);
  const pendingAction = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (!hasMeaningfulContent) return;
    const preventUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [hasMeaningfulContent]);

  const requestDiscard = useCallback((action: () => void) => {
    if (!hasMeaningfulContent) { action(); return; }
    pendingAction.current = action;
    setOpen(true);
  }, [hasMeaningfulContent]);

  const cancelDiscard = useCallback(() => { pendingAction.current = null; setOpen(false); }, []);
  const confirmDiscard = useCallback(() => { const action = pendingAction.current; pendingAction.current = null; setOpen(false); action?.(); }, []);

  return { open, requestDiscard, cancelDiscard, confirmDiscard } as const;
}
