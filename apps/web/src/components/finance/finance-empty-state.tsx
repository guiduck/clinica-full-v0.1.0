import Link from "next/link";
import { CalendarRange, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
export function FinanceEmptyState({
  predictability = false,
}: {
  predictability?: boolean;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {predictability ? "Previsibilidade financeira" : "Fluxo de caixa"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {predictability
              ? "Previstos, efetivados e confirmações por período"
              : "Receitas, despesas e saldo do consultório"}
          </p>
        </div>
        <Link
          href={predictability ? "/financeiro" : "/financeiro/previsibilidade"}
          className={buttonVariants({ variant: "outline" })}
        >
          {predictability ? "Ver fluxo de caixa" : "Ver previsibilidade"}
        </Link>
      </header>
      <Alert>
        <AlertTitle>Serviço financeiro ainda não conectado</AlertTitle>
        <AlertDescription>
          A interface está disponível sem dados fictícios. Inclusões e
          alterações serão habilitadas quando o serviço financeiro estiver
          pronto.
        </AlertDescription>
      </Alert>
      <section className="grid gap-3 md:grid-cols-3">
        <Metric icon={Wallet} label="Saldo atual" />
        <Metric icon={TrendingUp} label="Receitas" />
        <Metric icon={TrendingDown} label="Despesas" />
      </section>
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <CalendarRange className="size-5 text-primary" />
          <div>
            <h2 className="font-semibold">
              {predictability ? "Calendário anual" : "Lançamentos"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {predictability
                ? "Os meses e projeções aparecerão aqui."
                : "Receitas e despesas aparecerão aqui."}
            </p>
          </div>
        </div>
        <div className="mt-8 rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          Nenhum dado financeiro disponível.
        </div>
      </Card>
    </div>
  );
}
function Metric({ icon: Icon, label }: { icon: typeof Wallet; label: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-xl font-bold">—</p>
      </div>
    </Card>
  );
}
