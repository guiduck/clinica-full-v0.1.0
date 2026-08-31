import Link from "next/link";
import { notFound } from "next/navigation";
import { PatientFinancialProfileForm } from "@/components/patients/patient-financial-profile-form";
import { PatientFinancialStatus } from "@/components/patients/patient-financial-status";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/require-user";
import { getPatient } from "@/services/patients/patients";

type Props = {
  params: Promise<{
    patientId: string;
  }>;
  searchParams?: Promise<{
    focus?: string;
  }>;
};

export default async function PatientFinancePage({ params, searchParams }: Props) {
  const user = await requireUser();
  const { patientId } = await params;
  const query = await searchParams;
  const patient = await getPatient(user.id, patientId).catch(() => null);

  if (!patient) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href={`/pacientes/${patient.id}`} className={buttonVariants({ variant: "link", className: "mb-2" })}>
              Voltar para {patient.name}
            </Link>
            <p className="text-sm text-muted-foreground">Financeiro do paciente</p>
            <h1 className="text-3xl font-semibold tracking-normal">{patient.name}</h1>
          </div>
          <PatientFinancialStatus isComplete={Boolean(patient.financialProfile?.isComplete)} />
        </header>

        {query?.focus === "payment" ? (
          <Card className="border-primary/40 bg-secondary">
            <CardHeader>
              <CardTitle>Complete os dados de pagamento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Esse cadastro libera o agendamento e evita cobrar sem metodo definido.
            </CardContent>
          </Card>
        ) : null}

        <PatientFinancialProfileForm patientId={patient.id} initialProfile={patient.financialProfile} />
      </div>
    </main>
  );
}
