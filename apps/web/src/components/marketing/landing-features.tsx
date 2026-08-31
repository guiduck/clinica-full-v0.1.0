import { landingContent } from "@/lib/seo/landing-content";

export function LandingFeatures() {
  return (
    <section id="recursos" className="border-y border-border bg-white/72">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">Recursos principais</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">O essencial da clínica em uma rotina única</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A base do produto nasce para reduzir dispersão: menos planilhas soltas, menos ferramentas desconectadas e mais clareza para o atendimento.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landingContent.modules.map((module) => {
            const Icon = module.icon;

            return (
              <article key={module.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
