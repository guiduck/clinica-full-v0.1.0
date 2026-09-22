"use client";

import * as React from "react";
import { AppointmentComposerContext } from "./appointment-composer-context";
import { AppointmentComposerDialog, type AppointmentComposerPatient } from "./appointment-composer-dialog";

export function AppointmentComposerProvider({ children, patients, whatsappConfigured }: { children: React.ReactNode; patients: AppointmentComposerPatient[]; whatsappConfigured: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [patientId, setPatientId] = React.useState<string>();
  const [transientPatient, setTransientPatient] = React.useState<AppointmentComposerPatient | null>(null);
  const openAppointmentComposer = React.useCallback((input?: { patientId?: string; patientName?: string }) => {
    setPatientId(input?.patientId);
    if (input?.patientId && input.patientName && !patients.some((patient) => patient.id === input.patientId)) {
      setTransientPatient({ id: input.patientId, name: input.patientName, hasCompleteFinancialProfile: true });
    }
    setOpen(true);
  }, [patients]);
  const value = React.useMemo(() => ({ openAppointmentComposer }), [openAppointmentComposer]);
  const composerPatients = transientPatient ? [...patients, transientPatient] : patients;
  return <AppointmentComposerContext.Provider value={value}>{children}<AppointmentComposerDialog open={open} onOpenChange={setOpen} patients={composerPatients} defaultPatientId={patientId} whatsappConfigured={whatsappConfigured} /></AppointmentComposerContext.Provider>;
}
