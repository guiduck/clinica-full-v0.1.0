"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Archive, CircleDollarSign, Edit3, MessageCircle, Plus, Search, WalletCards } from "lucide-react";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { PatientWizard } from "@/components/patients/patient-wizard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PatientSummary } from "@/types/patients";

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
const unavailable = { key: "patients.mutation", mode: "unavailable", title: "Ação ainda não disponível", message: "A interface está pronta, mas esta alteração será conectada quando o service correspondente estiver disponível. Nenhum dado foi modificado.", affectedAction: "mutate" } as const;

export function PatientList({ patients }: { patients: PatientSummary[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("todos");
  const [wizard, setWizard] = React.useState(params.get("new") === "1");
  const filtered = patients.filter((patient) => {
    const matches = [patient.name, patient.email, patient.phone, patient.cpf].filter(Boolean).some((value) => value!.toLowerCase().includes(query.toLowerCase()));
    return matches && (filter === "todos" || patient.status === filter);
  });
  return (
    <main className="app-page space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Pacientes</h1><p className="mt-1 text-muted-foreground">Gestão da sua carteira clínica</p></div><Button onClick={() => setWizard(true)}><Plus className="size-4" />Novo paciente</Button></header>
      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, CPF, e-mail ou telefone..." /></div><Tabs value={filter} onValueChange={setFilter}><TabsList className="w-full lg:w-auto"><TabsTrigger value="todos">Todos</TabsTrigger><TabsTrigger value="ativo">Ativos</TabsTrigger><TabsTrigger value="inativo">Inativos</TabsTrigger><TabsTrigger value="arquivado">Arquivados</TabsTrigger></TabsList></Tabs></div>
        {!filtered.length ? <div className="grid min-h-64 place-items-center text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"><Search className="size-5" /></span><p className="mt-4 font-medium">{patients.length ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado ainda"}</p><p className="mt-1 text-sm text-muted-foreground">{patients.length ? "Ajuste a busca ou os filtros." : "Comece cadastrando o primeiro paciente da sua carteira clínica."}</p><Button className="mt-4" onClick={() => setWizard(true)}><Plus className="size-4" />Novo paciente</Button></div></div> : (
          <div className="mt-5 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="py-3">Paciente</th><th>Contato</th><th>Status</th><th>Última sessão</th><th className="text-right">Ações</th></tr></thead><tbody>{filtered.map((patient) => <tr key={patient.id} className="border-b last:border-0"><td className="py-4"><Link href={`/pacientes/${patient.id}`} className="flex items-center gap-3 font-medium"><Avatar className="size-9"><AvatarFallback className="bg-brand-soft text-xs text-primary">{initials(patient.name)}</AvatarFallback></Avatar>{patient.name}</Link></td><td><p>{patient.email ?? "E-mail não informado"}</p><p className="text-xs text-muted-foreground">{patient.phone}</p></td><td><Badge tone={patient.status === "ativo" ? "success" : "neutral"}>{patient.status === "ativo" ? "Ativo" : patient.status === "inativo" ? "Inativo" : "Arquivado"}</Badge></td><td className="text-muted-foreground">—</td><td><div className="flex justify-end gap-1"><CapabilityNotice descriptor={{ ...unavailable, key: "patients.whatsapp", title: "WhatsApp ainda não conectado", message: "O envio manual será habilitado quando o service de mensagens estiver disponível. Nenhuma mensagem foi enviada.", affectedAction: "send" }} trigger={<span><Action label="WhatsApp" icon={MessageCircle} /></span>} /><Action label="Financeiro" icon={CircleDollarSign} onClick={() => router.push(`/pacientes/${patient.id}?tab=financeiro`)} /><Action label="Dados de pagamento" icon={WalletCards} onClick={() => router.push(`/pacientes/${patient.id}/financeiro?focus=payment`)} /><CapabilityNotice descriptor={unavailable} trigger={<span><Action label="Editar" icon={Edit3} /></span>} /><CapabilityNotice descriptor={unavailable} trigger={<span><Action label="Arquivar paciente" icon={Archive} /></span>} /></div></td></tr>)}</tbody></table></div>
        )}
      </Card>
      <PatientWizard open={wizard} onOpenChange={(value) => { setWizard(value); if (!value && params.get("new")) router.replace("/pacientes"); }} />
    </main>
  );
}
function Action({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick?: () => void }) { return <Tooltip><TooltipTrigger asChild><button type="button" onClick={onClick} className="grid size-10 place-items-center rounded-md hover:bg-muted" aria-label={label}><Icon className="size-4" /></button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>; }
