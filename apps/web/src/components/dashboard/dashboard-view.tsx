"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  LayoutGrid,
  MessageSquare,
  Plus,
  Receipt,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { updateUserUiPreferenceAction } from "@/actions/ui-preferences";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardSectionKey } from "@/types/ui-preferences";

type DashboardAppointment = {
  id: string;
  patientId: string;
  patientName: string;
  startsAt: string;
  endsAt: string;
  status: string;
};
type DashboardPatient = { id: string; name: string; status: string };

const PERIOD_OPTIONS = [
  { value: "week", label: "Semana" },
  { value: "1m", label: "Mês" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1y", label: "Ano" },
] as const;
type Period = (typeof PERIOD_OPTIONS)[number]["value"];

const DEFAULT_ORDER: DashboardSectionKey[] = ["appointments", "finance", "messages", "patients"];
const LABELS: Record<DashboardSectionKey, string> = {
  appointments: "Próximos atendimentos e lembretes",
  finance: "Receitas x Despesas",
  messages: "Mensagens programadas",
  patients: "Resumo do consultório",
};

const monthSeries = [
  { mes: "mar", key: "2026-03", saldo: 0 },
  { mes: "abr", key: "2026-04", saldo: 0 },
  { mes: "mai", key: "2026-05", saldo: 0 },
  { mes: "jun", key: "2026-06", saldo: 0 },
  { mes: "jul", key: "2026-07", saldo: 0 },
  { mes: "ago", key: "2026-08", saldo: 0 },
];
const formatBRL = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
const dateLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(value));
const timeLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function DashboardView({
  firstName,
  patients,
  appointments,
  initialOrder,
  initialFinancialHidden,
  showNews,
}: Readonly<{
  firstName: string;
  patients: DashboardPatient[];
  appointments: DashboardAppointment[];
  initialOrder: DashboardSectionKey[] | null;
  initialFinancialHidden: boolean;
  showNews: boolean;
}>) {
  const router = useRouter();
  const [order, setOrder] = React.useState<DashboardSectionKey[]>(initialOrder?.length ? initialOrder : DEFAULT_ORDER);
  const [editing, setEditing] = React.useState(false);
  const [period, setPeriod] = React.useState<Period>("6m");
  const [hidden, setHidden] = React.useState(initialFinancialHidden);
  const [newsVisible, setNewsVisible] = React.useState(showNews);
  const [messageVisible, setMessageVisible] = React.useState(false);
  const todayKey = new Date().toDateString();
  const todaysAppointments = appointments.filter((item) => new Date(item.startsAt).toDateString() === todayKey);
  const upcoming = appointments.filter((item) => new Date(item.startsAt) >= new Date()).slice(0, 5);

  const onDrop = (result: DropResult) => {
    if (!result.destination) return;
    const next = [...order];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setOrder(next);
    React.startTransition(() => {
      void updateUserUiPreferenceAction({ operation: "set_dashboard_order", sectionKeys: next });
    });
  };
  const toggleFinancial = () => {
    const next = !hidden;
    setHidden(next);
    React.startTransition(() => {
      void updateUserUiPreferenceAction({ operation: "set_financial_visibility", hidden: next });
    });
  };
  const dismissNews = () => {
    setNewsVisible(false);
    React.startTransition(() => {
      void updateUserUiPreferenceAction({ operation: "dismiss_news_banner" });
    });
  };
  const chartPoint = (key?: string) => {
    if (!key) return;
    const [year, month] = key.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    router.push(`/financeiro?period=custom&from=01/${String(month).padStart(2, "0")}/${year}&to=${lastDay}/${String(month).padStart(2, "0")}/${year}`);
  };

  const nodes: Record<DashboardSectionKey, React.ReactNode> = {
    appointments: (
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="min-h-80 p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div><h2 className="font-semibold">Próximos atendimentos</h2><p className="text-sm text-muted-foreground">Sessões agendadas para os próximos dias</p></div>
            <Button asChild variant="ghost" size="sm"><Link href="/agenda">Ver todos <ChevronRight className="size-4" /></Link></Button>
          </div>
          {upcoming.length ? (
            <div className="space-y-4">
              <div className="flex gap-2 text-xs"><span className="rounded-full bg-primary/15 px-2 py-1 font-medium text-primary"><span className="status-dot mr-1 bg-primary" />{todaysAppointments.length} hoje</span><span className="rounded-full bg-info/15 px-2 py-1 font-medium text-info">0 amanhã</span></div>
              <ul className="divide-y">
                {upcoming.map((item, index) => <li key={item.id} className={cn("py-3", index === 0 && "border-l-2 border-primary pl-2")}>
                  <Link href={`/agenda?date=${item.startsAt.slice(0, 10)}&appointment=${item.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-primary/5">
                    <Avatar className="size-9"><AvatarFallback className="bg-brand-soft text-xs text-primary">{initials(item.patientName)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="truncate font-medium">{item.patientName}</p><p className="text-xs text-muted-foreground">{dateLabel(item.startsAt)} • {timeLabel(item.startsAt)}</p></div>
                    {index === 0 ? <span className="text-[10px] font-semibold uppercase text-primary">Próxima</span> : null}
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs capitalize text-primary">{item.status}</span>
                  </Link>
                </li>)}
              </ul>
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title="Sem atendimentos próximos" description="Você não tem sessões agendadas. Que tal criar uma?" action={<Button asChild size="sm"><Link href="/agenda?new=1">Novo agendamento</Link></Button>} />
          )}
        </Card>
        <Card className="min-h-80 p-6">
          <h2 className="font-semibold">Lembretes</h2><p className="text-sm text-muted-foreground">Clique para ir direto à seção</p>
          <p className="py-8 text-sm text-muted-foreground">Nenhum lembrete no momento. Tudo em dia!</p>
        </Card>
      </section>
    ),
    finance: (
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="font-semibold">Receitas x Despesas</h2><p className="text-xs text-muted-foreground">Resumo financeiro deste mês e tendência de saldo</p></div>
          <div className="flex items-center gap-2"><div className="inline-flex rounded-md border p-0.5 text-xs">{PERIOD_OPTIONS.map((option) => <button key={option.value} onClick={() => setPeriod(option.value)} className={cn("rounded px-2 py-1", period === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{option.label}</button>)}</div><Button variant="ghost" size="icon" onClick={toggleFinancial} aria-label={hidden ? "Exibir valores" : "Ocultar valores"}>{hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button></div>
        </div>
        {hidden ? <div className="grid h-56 place-items-center text-sm text-muted-foreground">Valores ocultos. Clique no ícone para exibir.</div> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: "Receitas", value: 1 }, { name: "Despesas", value: 0 }]} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}><Cell fill="var(--success)" /><Cell fill="var(--warning)" /></Pie><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="grid grid-cols-2 text-center text-sm"><div><p className="text-xs text-muted-foreground">Receita</p><strong className="text-success">{formatBRL(0)}</strong></div><div><p className="text-xs text-muted-foreground">Despesa</p><strong className="text-warning">{formatBRL(0)}</strong></div></div></div>
            <div><h3 className="text-sm font-medium">Saldo acumulado ({PERIOD_OPTIONS.find((option) => option.value === period)?.label})</h3><p className="mb-1 text-[11px] text-muted-foreground">Clique em um ponto para filtrar no financeiro</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthSeries} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `R$${value}`} /><ChartTooltip formatter={(value) => formatBRL(Number(value))} /><Line type="monotone" dataKey="saldo" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={((props: { cx?: number; cy?: number; payload?: { key?: string } }) => <circle cx={props.cx} cy={props.cy} r={6} fill="var(--primary)" className="cursor-pointer" onClick={() => chartPoint(props.payload?.key)} />) as never} /></LineChart></ResponsiveContainer></div></div>
          </div>
        )}
      </Card>
    ),
    messages: (
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare className="size-4 text-primary" /><h3 className="font-semibold">Mensagens programadas</h3></div><Button asChild variant="ghost" size="sm"><Link href="/configuracoes?tab=mensagens">Ver fila <ChevronRight className="size-4" /></Link></Button></div>
        {messageVisible ? <div className="flex items-center justify-between gap-3 border-t py-3"><div><p className="text-sm font-medium">Boas-vindas — paciente</p><p className="text-xs text-muted-foreground">WHATSAPP • aguardando confirmação</p></div><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => toast.info("O envio será conectado quando o serviço de mensagens estiver disponível.")}>Revisar e enviar</Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => setMessageVisible(false)}><Trash2 className="size-4" /></Button></div></div> : <p className="py-4 text-sm text-muted-foreground">Nenhuma mensagem programada no momento.</p>}
      </Card>
    ),
    patients: (
      <section id="tour-dashboard-summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4"><span className="sr-only">Resumo de {patients.filter((patient) => patient.status === "ativo").length} pacientes ativos</span>
        <SummaryCard href="/agenda?view=dia" label="Sessões hoje" value={String(todaysAppointments.length)} icon={CalendarCheck} accent="bg-info/15 text-info" />
        <SummaryCard href="/financeiro?period=1m" label="Saldo atual" value={hidden ? "••••••" : formatBRL(0)} icon={Wallet} accent="bg-brand-soft text-primary" />
        <SummaryCard href="/financeiro?tab=receitas&period=1m" label="Receita prevista" value={hidden ? "••••••" : formatBRL(0)} icon={TrendingUp} accent="bg-success/15 text-success" />
        <SummaryCard href="/financeiro?tab=receitas&status=pendentes" label="Pacientes inadimplentes" value={hidden ? "••••••" : formatBRL(0)} icon={AlertCircle} accent="bg-warning/15 text-warning" />
      </section>
    ),
  };

  return (
    <div className="app-page space-y-6">
      <header><h1 className="text-3xl font-bold">Olá{firstName ? `, ${firstName}` : ""}!</h1><p className="mt-1 text-muted-foreground">Aqui está um resumo do seu consultório hoje.</p></header>
      {newsVisible ? <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-r from-brand-soft/80 to-card"><div className="flex min-h-36 items-stretch"><div className="hidden w-36 place-items-center bg-primary/5 sm:grid"><Sparkles className="size-12 text-primary/35" /></div><div className="flex-1 p-5"><div className="flex items-center gap-2"><span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">NOVO</span><h2 className="font-semibold">Filtros de período no Financeiro</h2></div><p className="mt-1 text-sm text-muted-foreground">Agora você filtra receitas, despesas e gráficos por período direto pela URL. Resumo do mês selecionado, layout personalizável e cobranças no cadastro de paciente.</p><Link href="/financeiro" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">Conhecer a feature <ChevronRight className="size-4" /></Link></div><Button variant="ghost" size="icon" className="absolute right-3 top-3" onClick={dismissNews}><X className="size-4" /></Button></div></Card> : null}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3"><Link href="/pacientes?new=1" className={cn(buttonVariants({ variant: "outline" }), "h-auto justify-start py-3")}><Plus className="size-4" /> Novo paciente</Link><Link href="/agenda?new=1" className={cn(buttonVariants({ variant: "outline" }), "h-auto justify-start py-3")}><CalendarDays className="size-4" /> Novo agendamento</Link><Link href="/financeiro?new=receita" className={cn(buttonVariants({ variant: "outline" }), "col-span-2 h-auto justify-start py-3 lg:col-span-1")}><Receipt className="size-4" /> Registro financeiro</Link></div>
      <div className="flex justify-end"><Button variant="outline" size="sm" onClick={() => setEditing((value) => !value)}><LayoutGrid className="size-4" /> {editing ? "Concluir edição" : "Editar layout"}</Button></div>
      <DragDropContext onDragEnd={onDrop}><Droppable droppableId="dashboard-sections">{(provided) => <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">{order.map((key, index) => <Draggable key={key} draggableId={key} index={index} isDragDisabled={!editing}>{(item, snapshot) => <div ref={item.innerRef} {...item.draggableProps} className={cn("relative", snapshot.isDragging && "opacity-90 shadow-elevated")}>{editing ? <div {...item.dragHandleProps} className="mb-2 flex cursor-grab items-center gap-2 rounded-md border border-dashed bg-card px-3 py-2 text-xs font-medium text-muted-foreground"><GripVertical className="size-4" />{LABELS[key]}</div> : null}{nodes[key]}</div>}</Draggable>)}{provided.placeholder}</div>}</Droppable></DragDropContext>
    </div>
  );
}

function SummaryCard({ href, label, value, icon: Icon, accent }: { href: string; label: string; value: string; icon: React.ElementType; accent: string }) {
  return <Link href={href}><Card className="h-full p-5 transition-all hover:border-primary/40 hover:shadow-sm"><div className="flex items-start gap-3"><p className="min-w-0 flex-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><span className={cn("grid size-9 place-items-center rounded-lg", accent)}><Icon className="size-4" /></span></div><p className="mt-3 text-2xl font-bold">{value}</p></Card></Link>;
}
function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return <div className="py-10 text-center"><span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"><Icon className="size-5" /></span><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{description}</p>{action ? <div className="mt-4">{action}</div> : null}</div>;
}
