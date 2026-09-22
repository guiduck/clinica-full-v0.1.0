"use client";

import * as React from "react";

type OpenAppointmentComposerInput = { patientId?: string; patientName?: string };
type AppointmentComposerContextValue = {
  openAppointmentComposer: (input?: OpenAppointmentComposerInput) => void;
};

const AppointmentComposerContext = React.createContext<AppointmentComposerContextValue>({
  openAppointmentComposer: () => undefined,
});

export function useAppointmentComposer() {
  const context = React.useContext(AppointmentComposerContext);
  return context;
}

export { AppointmentComposerContext };
export type { AppointmentComposerContextValue };
