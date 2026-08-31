import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartPulse } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { landingContent } from "@/lib/seo/landing-content";

export function LandingHero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:pb-20 lg:pt-14">
      <div className="max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
          <HeartPulse className="h-4 w-4 text-primary" aria-hidden="true" />
          Gestão clínica para profissionais autônomos
        </div>
        <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
          {landingContent.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{landingContent.heroSubtitle}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className={buttonVariants({ size: "lg" })} href={landingContent.primaryCtaHref}>
            {landingContent.primaryCtaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a className={buttonVariants({ variant: "outline", size: "lg" })} href="#recursos">
            {landingContent.secondaryCtaLabel}
          </a>
        </div>
        <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {["Sem autenticação real neste primeiro slice", "Conteúdo público indexável e rápido", "Português claro para o mercado brasileiro", "Preparado para evoluir com segurança"].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-white/90 p-5 shadow-sm">
        <div className="rounded-md bg-secondary p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Painel futuro</p>
              <p className="text-xl font-semibold">Rotina clínica organizada</p>
            </div>
            <div className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">MVP</div>
          </div>
          <div className="space-y-3">
            {["Paciente confirmado para hoje", "Evolução clínica pendente", "Recibo pronto para emissão", "Lembrete de consulta preparado"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-md bg-white px-4 py-3 text-sm shadow-sm">
                <span>{item}</span>
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
