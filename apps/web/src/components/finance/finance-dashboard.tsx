"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle, BarChart3, Edit3, Filter, LayoutGrid, PieChart as PieIcon,
  Plus, Receipt, Search, Trash2, TrendingDown, TrendingUp, Wallet, X,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis,
} from "recharts";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { FinanceEntryView, FinancePatientOption } from "@/types/finance";

type TabKey = "todos" | "receitas" | "despesas" | "recibos" | "categorias";
type ChartKind = "donut" | "bars";
const tabs: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: "todos", label: "Todos" }, { key: "receitas", label: "Receitas" },
  { key: "despesas", label: "Despesas" }, { key: "recibos", label: "Recibos" },
  { key: "categorias", label: "Categorias" },
];
const unavailable = {
  key: "finance-ledger-write", mode: "unavailable" as const, affectedAction: "mutate" as const,
  title: "Serviço financeiro em preparação",
  message: "A experiência já está reconstruída, mas este lançamento não será salvo enquanto o livro-caixa financeiro não estiver conectado. Nenhum dado fictício foi criado.",
};

function money(cents: number) { return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function dateBR(value: string) { return new Intl.DateTimeFormat("pt-BR").format(new Date(value)); }
function payment(value: string) { return ({ pix: "Pix", card: "Cartão", cash: "Dinheiro", insurance: "Convênio" } as Record<string, string>)[value] ?? value; }
function isoFromBR(value: string) { const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value); return match ? `${match[3]}-${match[2]}-${match[1]}` : ""; }
function brFromIso(value: string) { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); return match ? `${match[3]}/${match[2]}/${match[1]}` : value; }
function maskDate(value: string) { const d = value.replace(/\D/g, "").slice(0, 8); return d.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2"); }

function monthsForPeriod(period: string) {
  if (period === "3m") return 3;
  if (period === "6m") return 6;
  if (period === "1y") return 12;
  return 1;
}

function initialFinanceEntryType(value: string | null) {
  if (value === "despesa") return "despesa" as const;
  if (value === "receita") return "receita" as const;
  return null;
}

function financeEntryStatusTone(status: FinanceEntryView["status"]) {
  if (status === "efetivado") return "success" as const;
  if (status === "cancelado") return "danger" as const;
  return "default" as const;
}

function financeEntryStatusLabel(status: FinanceEntryView["status"]) {
  if (status === "efetivado") return "Efetivado";
  if (status === "cancelado") return "Cancelado";
  return "Previsto";
}

function rangeFor(period: string, from: string, to: string) {
  const now = new Date();
  if (period === "custom") return { start: from ? new Date(`${isoFromBR(from)}T00:00:00`) : new Date(1970, 0, 1), end: to ? new Date(`${isoFromBR(to)}T23:59:59`) : new Date(2999, 11, 31) };
  const end = period === "week" ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const months = monthsForPeriod(period);
  const start = period === "week" ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) : new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  return { start, end };
}

export function FinanceDashboard({ entries, patients }: { entries: FinanceEntryView[]; patients: FinancePatientOption[] }) {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = (tabs.some((item) => item.key === search.get("tab")) ? search.get("tab") : "todos") as TabKey;
  const period = search.get("period") ?? search.get("periodo") ?? "1m";
  const status = search.get("status") ?? "todos";
  const category = search.get("category") ?? search.get("categoria") ?? "todas";
  const query = search.get("q") ?? "";
  const from = brFromIso(search.get("from") ?? "");
  const to = brFromIso(search.get("to") ?? "");
  const [chartKind, setChartKind] = React.useState<ChartKind>("donut");
  const [newType, setNewType] = React.useState<"receita" | "despesa" | null>(
    () => initialFinanceEntryType(search.get("new")),
  );
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const patchQuery = React.useCallback((patch: Record<string, string | null>) => {
    const params = new URLSearchParams(search.toString());
    Object.entries(patch).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, search]);
  const range = rangeFor(period, from, to);
  const filtered = entries.filter((entry) => {
    if (tab === "receitas" && entry.type !== "receita") return false;
    if (tab === "despesas" && entry.type !== "despesa") return false;
    if (status !== "todos" && !(status === "pendentes" ? entry.status === "previsto" : entry.status === status)) return false;
    if (category !== "todas" && entry.category !== category) return false;
    if (query && !`${entry.description} ${entry.patientName}`.toLowerCase().includes(query.toLowerCase())) return false;
    const date = new Date(entry.date); return date >= range.start && date <= range.end;
  });
  const active = filtered.filter((entry) => entry.status !== "cancelado");
  const effectiveRevenue = active.filter((entry) => entry.type === "receita" && entry.status === "efetivado").reduce((sum, entry) => sum + entry.valueCents, 0);
  const effectiveExpense = active.filter((entry) => entry.type === "despesa" && entry.status === "efetivado").reduce((sum, entry) => sum + entry.valueCents, 0);
  const expected = active.filter((entry) => entry.type === "receita" && entry.status === "previsto").reduce((sum, entry) => sum + entry.valueCents, 0);
  const chartData = [{ name: "Receitas", value: effectiveRevenue }, { name: "Despesas", value: effectiveExpense }];
  const daily = Array.from({ length: 6 }, (_, index) => { const d = new Date(); d.setMonth(d.getMonth() - (5 - index)); const same = active.filter((item) => { const x = new Date(item.date); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }); const receitas = same.filter((x) => x.type === "receita" && x.status === "efetivado").reduce((s, x) => s + x.valueCents / 100, 0); const despesas = same.filter((x) => x.type === "despesa" && x.status === "efetivado").reduce((s, x) => s + x.valueCents / 100, 0); return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, mes: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), receitas, despesas, saldo: receitas - despesas }; });
  const isTable = tab === "todos" || tab === "receitas" || tab === "despesas";
  let primaryContent: React.ReactNode = <CategoriesPanel />;
  if (tab === "recibos") {
    primaryContent = <EmptyPanel icon={Receipt} title="Nenhum recibo emitido" text="Selecione uma receita efetivada para emitir o primeiro recibo." action="Emitir recibo" onAction={() => setReceiptOpen(true)} />;
  }
  if (isTable) {
    primaryContent = <>
      <div className="mt-5 grid gap-3 md:grid-cols-[140px_150px_150px_160px_1fr]">
        <div><Label className="text-xs">Período</Label><Select value={period} onValueChange={(value) => patchQuery({ period: value, periodo: null, from: null, to: null })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="week">Semana</SelectItem><SelectItem value="1m">Mês atual</SelectItem><SelectItem value="3m">3 meses</SelectItem><SelectItem value="6m">6 meses</SelectItem><SelectItem value="1y">Ano</SelectItem><SelectItem value="custom">Personalizado</SelectItem></SelectContent></Select></div>
        <div><Label className="text-xs">De</Label><Input className="mt-1" inputMode="numeric" placeholder="dd/mm/aaaa" value={from} onChange={(e) => patchQuery({ from: isoFromBR(maskDate(e.target.value)) || null, period: "custom" })} /></div>
        <div><Label className="text-xs">Até</Label><Input className="mt-1" inputMode="numeric" placeholder="dd/mm/aaaa" value={to} onChange={(e) => patchQuery({ to: isoFromBR(maskDate(e.target.value)) || null, period: "custom" })} /></div>
        <div><Label className="text-xs">Status</Label><Select value={status} onValueChange={(value) => patchQuery({ status: value === "todos" ? null : value })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="pendentes">Pendentes</SelectItem><SelectItem value="efetivado">Efetivados</SelectItem><SelectItem value="cancelado">Cancelados</SelectItem></SelectContent></Select></div>
        <div><Label className="text-xs">Pesquisar</Label><div className="relative mt-1"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Nome ou descrição..." value={query} onChange={(e) => patchQuery({ q: e.target.value || null })} /></div></div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => patchQuery({ period: null, periodo: null, from: null, to: null, status: null, category: null, categoria: null, q: null })}><X className="size-3.5" /> Limpar filtros</button><span>Total filtrado: <strong className="text-success">{money(active.reduce((sum, item) => sum + (item.type === "receita" ? item.valueCents : -item.valueCents), 0))}</strong></span></div>
      <FinanceTable entries={filtered} />
    </>;
  }
  const hasEffectiveEntries = Boolean(effectiveRevenue || effectiveExpense);
  let flowChartContent: React.ReactNode = <div className="grid h-full place-items-center text-center text-sm text-muted-foreground"><div><PieIcon className="mx-auto mb-3 size-9 opacity-30" />Nenhum lançamento efetivado no período.</div></div>;
  if (hasEffectiveEntries && chartKind === "donut") {
    flowChartContent = <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}><Cell fill="var(--success)" /><Cell fill="var(--warning)" /></Pie><ChartTooltip formatter={(v) => money(Number(v))} /><Legend /></PieChart></ResponsiveContainer>;
  }
  if (hasEffectiveEntries && chartKind === "bars") {
    flowChartContent = <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(v) => `R$${Number(v) / 100}`} /><ChartTooltip formatter={(v) => money(Number(v))} /><Bar dataKey="value" fill="var(--primary)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>;
  }
  return <div className="mx-auto max-w-[1360px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Financeiro</h1><p className="mt-1 text-muted-foreground">Receitas, despesas e fluxo de caixa</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setReceiptOpen(true)}><Receipt className="size-4" /> Emitir recibo</Button><Button variant="outline" onClick={() => setNewType("despesa")}><Plus className="size-4" /> Nova despesa</Button><Button onClick={() => setNewType("receita")}><Plus className="size-4" /> Nova receita</Button></div></header>
    <div className="flex justify-end"><CapabilityNotice descriptor={{ ...unavailable, key: "finance-layout", title: "Personalização do Financeiro", message: "A disposição atual segue o protótipo. A persistência de um layout financeiro personalizado ainda não está conectada." }} trigger={<Button variant="outline" size="sm"><LayoutGrid className="size-4" /> Editar layout</Button>} /></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="min-h-[560px] p-5">
        <Tabs value={tab} onValueChange={(value) => patchQuery({ tab: value === "todos" ? null : value })}><TabsList className="grid w-full grid-cols-5"><>{tabs.map((item) => <TabsTrigger key={item.key} value={item.key}>{item.label}</TabsTrigger>)}</></TabsList></Tabs>
        {primaryContent}
      </Card>
      <aside className="space-y-4"><Card className="p-4"><div className="mb-3 flex items-center justify-between border-b pb-3"><span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground"><Filter className="size-3.5" /> Resumo do período</span><span className="text-[11px] text-muted-foreground">{period === "1m" ? "Mês atual" : "Período filtrado"}</span></div><Metric label="Saldo" value={money(effectiveRevenue - effectiveExpense)} icon={Wallet} tone="text-primary" /><Metric label="Receita efetivada" value={money(effectiveRevenue)} icon={TrendingUp} tone="text-success" /><Metric label="Despesa efetivada" value={money(effectiveExpense)} icon={TrendingDown} tone="text-warning" /><Metric label="Receita prevista" value={money(expected)} icon={AlertCircle} tone="text-destructive" /></Card>
        <Card className="p-4"><div className="flex items-start justify-between"><div><h2 className="font-semibold">Fluxo financeiro</h2><p className="text-xs text-muted-foreground">Receitas vs. despesas — período</p></div></div><div className="mt-2 flex w-fit rounded-md border p-0.5"><button type="button" className={cn("min-h-11 rounded px-2 py-1 text-xs", chartKind === "donut" && "bg-primary text-primary-foreground")} onClick={() => setChartKind("donut")}><PieIcon className="mr-1 inline size-3" />Donut</button><button type="button" className={cn("min-h-11 rounded px-2 py-1 text-xs", chartKind === "bars" && "bg-primary text-primary-foreground")} onClick={() => setChartKind("bars")}><BarChart3 className="mr-1 inline size-3" />Barras</button></div><div className="mt-3 h-64">{flowChartContent}</div></Card>
      </aside>
    </div>
    <div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><h2 className="font-semibold">Saldo acumulado</h2><p className="text-xs text-muted-foreground">Clique em um ponto para filtrar pelo mês</p><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={daily}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis tickFormatter={(v) => `R$${v}`} /><ChartTooltip formatter={(v) => money(Number(v) * 100)} /><Line type="monotone" dataKey="saldo" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div></Card><Card className="p-5"><h2 className="font-semibold">Despesas por categoria</h2><p className="text-xs text-muted-foreground">De onde sai o dinheiro do consultório</p><div className="grid h-64 place-items-center text-sm text-muted-foreground">Sem despesas cadastradas ainda.</div></Card></div>
    <FinanceEntryDialog open={newType !== null} onOpenChange={(open) => !open && setNewType(null)} initialType={newType ?? "receita"} patients={patients} defaultPatientId={search.get("patientId") ?? ""} />
    <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} entries={entries.filter((item) => item.type === "receita" && item.status === "efetivado")} />
  </div>;
}

function FinanceTable({ entries }: { entries: FinanceEntryView[] }) { return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="py-3">Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Pagamento</th><th>Status</th><th className="text-right">Valor</th><th /></tr></thead><tbody>{entries.length ? entries.map((entry) => <tr key={entry.id} className="border-b last:border-0"><td className="py-4">{dateBR(entry.date)}</td><td className="max-w-72 truncate font-medium">{entry.description}</td><td><Badge tone="neutral">{entry.category}</Badge></td><td className={entry.type === "receita" ? "text-success" : "text-warning"}>{entry.type === "receita" ? "Receita" : "Despesa"}</td><td>{payment(entry.paymentMethod)}</td><td><Badge tone={financeEntryStatusTone(entry.status)}>{financeEntryStatusLabel(entry.status)}</Badge></td><td className={cn("text-right font-semibold", entry.type === "receita" ? "text-success" : "text-warning")}>{money(entry.valueCents)}</td><td><div className="flex justify-end"><CapabilityNotice descriptor={unavailable} trigger={<Button variant="ghost" size="icon" aria-label="Editar lançamento"><Edit3 className="size-4" /></Button>} /><CapabilityNotice descriptor={{ ...unavailable, key: "finance-delete" }} trigger={<Button variant="ghost" size="icon" aria-label="Excluir lançamento" className="text-destructive"><Trash2 className="size-4" /></Button>} /></div></td></tr>) : <tr><td colSpan={8} className="py-24 text-center text-muted-foreground">Nenhum lançamento no período selecionado.</td></tr>}</tbody></table></div>; }
function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Wallet; tone: string }) { return <div className="flex items-center justify-between border-b py-3 last:border-0"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className={cn("mt-1 text-xl font-bold", tone)}>{value}</p></div><span className={cn("grid size-9 place-items-center rounded-lg bg-muted", tone)}><Icon className="size-4" /></span></div>; }
function EmptyPanel({ icon: Icon, title, text, action, onAction }: { icon: typeof Receipt; title: string; text: string; action: string; onAction: () => void }) { return <div className="grid min-h-96 place-items-center text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-muted"><Icon className="size-5 text-muted-foreground" /></span><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p><Button className="mt-4" onClick={onAction}>{action}</Button></div></div>; }
function CategoriesPanel() { return <div className="mt-5 grid gap-4 sm:grid-cols-2"><Card className="p-4"><h2 className="font-semibold">Categorias de receita</h2><div className="mt-3 flex items-center justify-between rounded-lg border p-3"><span>Avulso</span><Badge tone="neutral">Padrão</Badge></div></Card><Card className="p-4"><h2 className="font-semibold">Categorias de despesa</h2><p className="py-10 text-center text-sm text-muted-foreground">Nenhuma categoria personalizada.</p></Card></div>; }

function FinanceEntryDialog({ open, onOpenChange, initialType, patients, defaultPatientId }: { open: boolean; onOpenChange: (open: boolean) => void; initialType: "receita" | "despesa"; patients: FinancePatientOption[]; defaultPatientId: string }) {
  const [type, setType] = React.useState(initialType); const [patient, setPatient] = React.useState(defaultPatientId); const [category, setCategory] = React.useState(""); const [name, setName] = React.useState(""); const [method, setMethod] = React.useState("pix"); const [value, setValue] = React.useState(""); const [date, setDate] = React.useState(() => new Intl.DateTimeFormat("pt-BR").format(new Date())); const [status, setStatus] = React.useState("pendente"); const [blocked, setBlocked] = React.useState(false);
  React.useEffect(() => { if (open) { setType(initialType); setPatient(defaultPatientId); } }, [defaultPatientId, initialType, open]);
  return <><Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>Registro financeiro</DialogTitle><DialogDescription className="sr-only">Preencha os dados do lançamento financeiro</DialogDescription></DialogHeader><Tabs value={type} onValueChange={(v) => setType(v as typeof type)}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="receita"><TrendingUp className="mr-1 size-4" /> Receita</TabsTrigger><TabsTrigger value="despesa"><TrendingDown className="mr-1 size-4" /> Despesa</TabsTrigger></TabsList></Tabs><div className="space-y-4">
    {type === "receita" ? <Field label="Paciente *"><Select value={patient} onValueChange={setPatient}><SelectTrigger><SelectValue placeholder="Buscar paciente por nome..." /></SelectTrigger><SelectContent>{patients.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field> : null}
    <Field label="Categoria"><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Selecionar categoria..." /></SelectTrigger><SelectContent>{(type === "receita" ? ["Avulso", "Plano", "Outros"] : ["Aluguel", "Materiais", "Serviços", "Outros"]).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><p className="mt-1 text-xs text-muted-foreground">Gerencie suas categorias na aba Categorias.</p></Field>
    <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "receita" ? "Ex.: Sessão semanal" : "Ex.: Aluguel do consultório"} /></Field>
    <Field label="Método"><Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="card">Cartão</SelectItem><SelectItem value="cash">Dinheiro</SelectItem><SelectItem value="insurance">Convênio</SelectItem></SelectContent></Select></Field>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Valor (R$)"><Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" /></Field><Field label="Data do pagamento"><Input inputMode="numeric" value={date} onChange={(e) => setDate(maskDate(e.target.value))} /></Field></div>
    <Field label="Status"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="efetivado">Efetivado</SelectItem><SelectItem value="inadimplente">Inadimplente</SelectItem></SelectContent></Select></Field>
    <Field label="Vencimento"><Input inputMode="numeric" value={date} onChange={(e) => setDate(maskDate(e.target.value))} /><p className="mt-1 text-xs text-muted-foreground">Usado para alertas de cobranças em aberto.</p></Field>
    <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-xs text-warning">No plano Ouro, cartão e boleto geram cobranças automáticas e atualizam o status via webhook.</div>
  </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={() => setBlocked(true)}>Salvar</Button></DialogFooter></DialogContent></Dialog><CapabilityNotice descriptor={unavailable} open={blocked} onOpenChange={setBlocked} /></>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><Label className="mb-1.5 block text-xs">{label}</Label>{children}</div>; }
function ReceiptDialog({ open, onOpenChange, entries }: { open: boolean; onOpenChange: (open: boolean) => void; entries: FinanceEntryView[] }) { const [selected, setSelected] = React.useState(""); const [blocked, setBlocked] = React.useState(false); return <><Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Emitir recibo</DialogTitle><DialogDescription>Selecione uma receita efetivada para montar o recibo.</DialogDescription></DialogHeader>{entries.length ? <Select value={selected} onValueChange={setSelected}><SelectTrigger><SelectValue placeholder="Selecione um lançamento" /></SelectTrigger><SelectContent>{entries.map((entry) => <SelectItem key={entry.id} value={entry.id}>{entry.patientName} · {dateBR(entry.date)} · {money(entry.valueCents)}</SelectItem>)}</SelectContent></Select> : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhuma receita efetivada está disponível.</div>}<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button disabled={!selected} onClick={() => setBlocked(true)}>Continuar</Button></DialogFooter></DialogContent></Dialog><CapabilityNotice descriptor={{ ...unavailable, key: "receipt-generate", title: "Emissão de recibos em preparação", message: "O modelo visual está pronto, mas a geração do documento fiscal ainda não está conectada. Nenhum recibo foi emitido." }} open={blocked} onOpenChange={setBlocked} /></>; }


