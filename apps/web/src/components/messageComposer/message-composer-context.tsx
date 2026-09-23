"use client";

import * as React from "react";
import type { MessageChannelView } from "@/types/messages";

type OpenMessageComposerInput = {
  patientId?: string;
  channel?: MessageChannelView;
};

type MessageComposerContextValue = {
  openMessageComposer: (input?: OpenMessageComposerInput) => void;
};

export const MessageComposerContext =
  React.createContext<MessageComposerContextValue>({
    openMessageComposer: () => undefined,
  });

export function useMessageComposer() {
  return React.useContext(MessageComposerContext);
}
