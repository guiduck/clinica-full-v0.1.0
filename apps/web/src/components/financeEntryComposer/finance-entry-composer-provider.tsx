"use client";

import * as React from "react";
import { FinanceEntryDialog } from "@/components/financeEntryEditor";
import type { FinancePatientOption } from "@/types/finance";
import { FinanceEntryComposerContext } from "./finance-entry-composer-context";

export function FinanceEntryComposerProvider({
  children,
  patients,
}: {
  children: React.ReactNode;
  patients: FinancePatientOption[];
}) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"receita" | "despesa">("receita");
  const [patientId, setPatientId] = React.useState("");

  const openFinanceEntryComposer = React.useCallback(
    (input?: { initialType?: "receita" | "despesa"; patientId?: string }) => {
      setType(input?.initialType ?? "receita");
      setPatientId(input?.patientId ?? "");
      setOpen(true);
    },
    [],
  );

  const value = React.useMemo(
    () => ({ openFinanceEntryComposer }),
    [openFinanceEntryComposer],
  );

  return (
    <FinanceEntryComposerContext.Provider value={value}>
      {children}
      <FinanceEntryDialog
        open={open}
        onOpenChange={setOpen}
        initialType={type}
        patients={patients}
        defaultPatientId={patientId}
      />
    </FinanceEntryComposerContext.Provider>
  );
}
