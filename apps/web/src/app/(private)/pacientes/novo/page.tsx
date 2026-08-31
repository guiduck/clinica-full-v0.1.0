import Link from "next/link";
import { PatientForm } from "@/components/patients/patient-form";
import { buttonVariants } from "@/components/ui/button";

export default function NewPatientPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <header className="flex flex-col gap-3">
          <Link href="/pacientes" className={buttonVariants({ variant: "link", className: "self-start" })}>
            Voltar para pacientes
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">Cadastro</p>
            <h1 className="text-3xl font-semibold tracking-normal">Novo paciente</h1>
          </div>
        </header>
        <PatientForm />
      </div>
    </main>
  );
}
