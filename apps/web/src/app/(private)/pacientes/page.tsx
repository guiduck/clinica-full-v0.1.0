import { PatientList } from "@/components/patients/patient-list";
import { requireUser } from "@/lib/auth/require-user";
import { searchPatients } from "@/services/patients/patients";

type Props = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function PatientsPage({ searchParams }: Props) {
  const user = await requireUser();
  const params = await searchParams;
  const query = params?.q ?? "";
  const patients = await searchPatients(user.id, query);

  const summaries = patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    cpf: patient.cpf,
    whatsappConsent: patient.whatsappConsent,
    status: patient.status,
    hasCompleteFinancialProfile: Boolean(patient.financialProfile?.isComplete)
  }));

  return <PatientList patients={summaries} />;
}
