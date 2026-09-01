import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";
import { LegalLinks } from "@/components/marketing/legal-links";
import { LandingFeatures } from "@/components/marketing/landing-features";
import { LandingHero } from "@/components/marketing/landing-hero";
import { LandingTrust } from "@/components/marketing/landing-trust";
import { buttonVariants } from "@/components/ui/button";
import { landingContent } from "@/lib/seo/landing-content";

export function LandingPage() {
  return (
    <main>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
          </span>
          {landingContent.brand}
        </Link>
        <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={landingContent.primaryCtaHref}>
          Login
        </Link>
      </header>
      <LandingHero />
      <LandingFeatures />
      <LandingTrust />
      <section className="bg-primary px-4 py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Comece pela entrada profissional</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d9f3ee]">
              Login e cadastro já funcionam com sessão server-side para validar a experiência inicial da Clínica Ágil.
            </p>
          </div>
          <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href={landingContent.primaryCtaHref}>
            Ir para login
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <LegalLinks />
        <p className="text-sm text-muted-foreground">
          Clínica Ágil organiza software para psicólogos, agenda para terapeutas, gestão de pacientes, prontuário psicológico, financeiro para clínica e recibos.
        </p>
      </footer>
    </main>
  );
}
