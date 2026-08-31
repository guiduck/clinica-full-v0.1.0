"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Edit3,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { PatientAnamneseTab, PatientClinicalRecordTab } from "@/components/patients/patient-clinical-tabs";
import { PatientDocumentsTab } from "@/components/patients/patient-documents-tab";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatBrazilianDate, formatStatusLabel, formatTime24 } from "@/utils/formatters";

type AppointmentView = { id: string; startsAt: string; endsAt: string; status: string; type: string };
type PatientView = {
  id: string; name: string; phone: string; email: string | null; cpf: string | null;
  birthDate: string | null; notes: string | null; whatsappConsent: boolean; emailConsent: boolean;
  status: string; financialComplete: boolean; defaultSessionPriceCents: number | null;
  appointments: AppointmentView[];
};
type Tab = "geral" | "anamnese" | "agenda" | "prontuario" | "financeiro" | "documentos";
const tabs: { key: Tab; label: string }[] = [
  { key: "geral", label: "Geral" }, { key: "anamnese", label: "Anamnese" },
  { key: "agenda", label: "Agenda" }, { key: "prontuario", label: "Prontuário" },
  { key: "financeiro", label: "Financeiro" }, { key: "documentos", label: "Documentos" },
];
const unavailable = { key: "patients.profile-save", mode: "unavailable", title: "Salvamento ainda não disponível", message: "Você pode preencher e revisar este fluxo completo. O conteúdo clínico e documental não será persistido até a liberação do service seguro correspondente.", affectedAction: "save" } as const;
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";

export function PatientProfileView({ patient, initialTab = "geral" }: { patient: PatientView; initialTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const selectTab = (value: string) => {
    const next = value as Tab;
    setTab(next);
    router.replace(`/pacientes/${patient.id}?tab=${next}`, { scroll: false });
  };
  return (
    <main className="app-page space-y-6">
      <Link href="/pacientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Pacientes</Link>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4"><Avatar className="size-14"><AvatarFallback className="bg-brand-soft text-lg font-semibold text-primary">{initials(patient.name)}</AvatarFallback></Avatar><div><div className="flex items-center gap-2"><h1 className="text-3xl font-bold">{patient.name}</h1><Badge tone={patient.status === "ativo" ? "success" : "muted"}>{formatStatusLabel(patient.status)}</Badge></div></div></div>
        <div className="flex gap-2"><Button variant="outline"><MessageCircle className="size-4" />WhatsApp</Button><CapabilityNotice descriptor={unavailable} trigger={<Button variant="outline"><Trash2 className="size-4" />Arquivar</Button>} /></div>
      </header>
      <Tabs value={tab} onValueChange={selectTab}>
        <TabsList className="max-w-full justify-start overflow-x-auto">{tabs.map((item) => <TabsTrigger key={item.key} value={item.key}>{item.label}</TabsTrigger>)}</TabsList>
        <TabsContent value="geral"><GeneralTab patient={patient} /></TabsContent>
        <TabsContent value="anamnese"><PatientAnamneseTab /></TabsContent>
        <TabsContent value="agenda"><AgendaTab patient={patient} /></TabsContent>
        <TabsContent value="prontuario"><PatientClinicalRecordTab /></TabsContent>
        <TabsContent value="financeiro"><FinanceTab patient={patient} /></TabsContent>
        <TabsContent value="documentos"><PatientDocumentsTab patientName={patient.name} /></TabsContent>
      </Tabs>
    </main>
  );
}

function GeneralTab({ patient }: { patient: PatientView }) {
  return <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
    <div className="space-y-6">
      <Card className="p-6"><div className="mb-5 flex justify-between"><h2 className="font-semibold">Contato, identificação e endereço</h2><CapabilityNotice descriptor={unavailable} trigger={<Button variant="ghost" size="icon" aria-label="Editar paciente"><Edit3 className="size-4" /></Button>} /></div><div className="grid gap-6 sm:grid-cols-2"><div className="space-y-4"><Info icon={Mail} label="E-mail" value={patient.email ?? "Não informado"} /><Info icon={Phone} label="Telefone" value={patient.phone} /><Info icon={FileText} label="CPF" value={patient.cpf ?? "Não informado"} /><Info icon={Calendar} label="Nascimento" value={patient.birthDate ? formatBrazilianDate(patient.birthDate) : "Não informado"} /></div><div><Info icon={MapPin} label="Endereço" value="Nenhum endereço cadastrado." /></div></div></Card>
      <Card className="p-6"><h2 className="mb-3 font-semibold">Queixa principal</h2><Textarea defaultValue={patient.notes ?? ""} placeholder="Motivo da busca..." /><p className="mt-2 text-xs text-muted-foreground">As alterações clínicas não são salvas nesta etapa.</p></Card>
    </div>
    <div className="space-y-6">
      <Card className="p-6"><h2 className="mb-5 font-semibold">Comunicação</h2><Consent label="WhatsApp" granted={patient.whatsappConsent} /><Consent label="E-mail" granted={patient.emailConsent} /><div className="mt-5 border-t pt-4 text-sm"><span className="text-muted-foreground">Convênio:</span> Particular</div></Card>
      <Card className="p-6"><h2 className="mb-3 font-semibold">Notas internas</h2><Textarea placeholder="Observações importantes..." /></Card>
    </div>
  </div>;
}

function AgendaTab({ patient }: { patient: PatientView }) {
  const now = new Date();
  const upcoming = patient.appointments.filter((item) => new Date(item.startsAt) >= now);
  const past = patient.appointments.filter((item) => new Date(item.startsAt) < now);
  return <div className="grid gap-6 lg:grid-cols-[1fr_2fr]"><Card className="p-6"><h2 className="font-semibold">Horário fixo</h2><p className="mt-1 text-sm text-muted-foreground">Configure a recorrência semanal deste paciente.</p><CapabilityNotice descriptor={unavailable} trigger={<Button className="mt-5 w-full" variant="outline"><CalendarPlus className="size-4" />Configurar horário fixo</Button>} /></Card><div className="space-y-6"><AppointmentList title="Próximas sessões" items={upcoming} empty="Nenhuma sessão futura." /><AppointmentList title="Sessões anteriores" items={past} empty="Nenhuma sessão anterior." /><Button asChild><Link href={`/agenda?new=1&patientId=${patient.id}`}><Plus className="size-4" />Agendar sessão</Link></Button></div></div>;
}
function AppointmentList({ title, items, empty }: { title: string; items: AppointmentView[]; empty: string }) { return <Card className="p-6"><h2 className="mb-4 font-semibold">{title}</h2>{items.length ? <ul className="divide-y">{items.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">{formatBrazilianDate(item.startsAt)} · {formatTime24(item.startsAt)}–{formatTime24(item.endsAt)}</p><p className="text-xs text-muted-foreground">{item.type}</p></div><Badge>{formatStatusLabel(item.status)}</Badge></li>)}</ul> : <p className="py-6 text-sm text-muted-foreground">{empty}</p>}</Card>; }

function FinanceTab({ patient }: { patient: PatientView }) {
  const value = patient.defaultSessionPriceCents ? (patient.defaultSessionPriceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00";
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><Metric label="Total pago" value="R$ 0,00" /><Metric label="Em aberto" value={patient.financialComplete ? value : "R$ 0,00"} /><Metric label="Valor por sessão" value={value} /></div><Card className="p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Histórico financeiro</h2><p className="text-sm text-muted-foreground">Lançamentos e recibos relacionados ao paciente</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link href={`/pacientes/${patient.id}/financeiro?focus=payment`}><Wallet className="size-4" />Dados de pagamento</Link></Button><Button asChild><Link href={`/financeiro?new=receita&patientId=${patient.id}`}><Plus className="size-4" />Novo lançamento</Link></Button></div></div><p className="py-14 text-center text-sm text-muted-foreground">Nenhum lançamento efetivado.</p></Card></div>;
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm">{value}</p></div></div>; }
function Consent({ label, granted }: { label: string; granted: boolean }) { return <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-sm">{granted ? <CheckCircle2 className="size-4 text-success" /> : <ShieldCheck className="size-4 text-muted-foreground" />}{label}</span><span className="text-xs">{granted ? "Revogar" : "Não autorizado"}</span></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <Card className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>; }
