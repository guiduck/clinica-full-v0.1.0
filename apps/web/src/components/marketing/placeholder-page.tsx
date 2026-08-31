import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type PlaceholderPageProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
};

export function PlaceholderPage({ title, description, backHref, backLabel }: PlaceholderPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-lg border border-border bg-white p-8 shadow-sm">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-primary">
          <Construction className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
        <Link className={buttonVariants({ className: "mt-8", variant: "outline" })} href={backHref}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      </section>
    </main>
  );
}
