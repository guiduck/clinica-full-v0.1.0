import { PatientList } from "@/components/patients/patient-list";
import { requireUser } from "@/lib/auth/require-user";
import { searchPatients } from "@/services/patients/patients";

type Props = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function PatientsPage({ searchParams }: Props) {
  const user = await requireUser();
  const params = await searchParams;
  const query = params?.q ?? "";
  const status =
    params?.status === "ativo" ||
    params?.status === "inativo" ||
    params?.status === "arquivado"
      ? params.status
      : undefined;
  const patients = await searchPatients(user.id, query, status);

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

  return (
    <PatientList
      patients={summaries}
      initialQuery={query}
      initialStatus={status ?? "todos"}
    />
  );
}
