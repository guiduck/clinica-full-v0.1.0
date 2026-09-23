"use client";

import * as React from "react";

type OpenFinanceEntryComposerInput = {
  initialType?: "receita" | "despesa";
  patientId?: string;
};

type FinanceEntryComposerContextValue = {
  openFinanceEntryComposer: (input?: OpenFinanceEntryComposerInput) => void;
};

export const FinanceEntryComposerContext =
  React.createContext<FinanceEntryComposerContextValue>({
    openFinanceEntryComposer: () => undefined,
  });

export function useFinanceEntryComposer() {
  return React.useContext(FinanceEntryComposerContext);
}
