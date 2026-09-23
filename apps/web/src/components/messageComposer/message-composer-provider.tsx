"use client";

import * as React from "react";
import type { MessageChannelView, MessagePatientOption } from "@/types/messages";
import { MessageComposerContext } from "./message-composer-context";
import { MessageComposerDialog } from "./message-composer-dialog";

export function MessageComposerProvider({
  children,
  patients,
}: {
  children: React.ReactNode;
  patients: MessagePatientOption[];
}) {
  const [open, setOpen] = React.useState(false);
  const [patientId, setPatientId] = React.useState<string>();
  const [channel, setChannel] = React.useState<MessageChannelView>("whatsapp");

  const openMessageComposer = React.useCallback(
    (input?: { patientId?: string; channel?: MessageChannelView }) => {
      setPatientId(input?.patientId);
      setChannel(input?.channel ?? "whatsapp");
      setOpen(true);
    },
    [],
  );

  const value = React.useMemo(
    () => ({ openMessageComposer }),
    [openMessageComposer],
  );

  return (
    <MessageComposerContext.Provider value={value}>
      {children}
      <MessageComposerDialog
        open={open}
        onOpenChange={setOpen}
        patients={patients}
        defaultPatientId={patientId}
        initialChannel={channel}
      />
    </MessageComposerContext.Provider>
  );
}
