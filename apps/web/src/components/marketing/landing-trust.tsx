import { LockKeyhole, ShieldCheck, Stethoscope, UserCheck } from "lucide-react";
import { landingContent } from "@/lib/seo/landing-content";

const icons = [ShieldCheck, LockKeyhole, Stethoscope, UserCheck] as const;

export function LandingTrust() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">Confiança antes do login</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">Privacidade, LGPD e clareza desde a entrada</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A Clinica Agil foi planejada para lidar com fluxos sensiveis de saúde com postura profissional. Neste primeiro slice, nenhuma credencial ou dado clinico e persistido.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {landingContent.trustStatements.map((statement, index) => {
            const Icon = icons[index] ?? ShieldCheck;

            return (
              <div key={statement} className="rounded-lg border border-border bg-white/82 p-5 shadow-sm">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{statement}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
