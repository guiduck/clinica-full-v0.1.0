"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Edit3, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import {
  createFinanceEntryAction,
  setFinanceEntryStatusAction,
  updateFinanceEntryAction,
  type FinanceActionState,
} from "@/actions/finance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { FinanceEntryView, FinancePatientOption } from "@/types/finance";

function dateBR(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function maskDate(value: string) {
  return value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
}

function EditorField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block text-xs">{label}</Label>{children}</div>;
}

export function FinanceEntryDialog({
  open,
  onOpenChange,
  initialType,
  patients,
  defaultPatientId,
  entry = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: "receita" | "despesa";
  patients: FinancePatientOption[];
  defaultPatientId: string;
  entry?: FinanceEntryView | null;
}) {
  const router = useRouter();
  const today = React.useMemo(() => new Intl.DateTimeFormat("pt-BR").format(new Date()), []);
  const [type, setType] = React.useState(initialType);
  const [patient, setPatient] = React.useState(defaultPatientId);
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [method, setMethod] = React.useState("cash");
  const [value, setValue] = React.useState("");
  const [date, setDate] = React.useState(today);
  const [dueDate, setDueDate] = React.useState(today);
  const [status, setStatus] = React.useState<"previsto" | "efetivado">("previsto");
  const [result, setResult] = React.useState<FinanceActionState>({ ok: false, message: "" });
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!open) return;
    const nextDate = entry ? dateBR(entry.date) : today;
    setType(entry?.type ?? initialType);
    setPatient(entry?.patientId ?? defaultPatientId);
    setCategory(entry?.category ?? "");
    setDescription(entry?.description ?? "");
    setMethod(entry?.paymentMethod ?? "cash");
    setValue(entry ? (entry.valueCents / 100).toFixed(2).replace(".", ",") : "");
    setDate(nextDate);
    setDueDate(entry ? dateBR(entry.dueDate) : nextDate);
    setStatus(entry?.status === "efetivado" ? "efetivado" : "previsto");
    setResult({ ok: false, message: "" });
  }, [defaultPatientId, entry, initialType, open, today]);

  const submit = () => {
    const formData = new FormData();
    formData.set("type", type);
    if (patient) formData.set("patientId", patient);
    formData.set("category", category);
    formData.set("description", description);
    formData.set("paymentMethod", method);
    formData.set("valueCents", value);
    formData.set("date", date);
    formData.set("dueDate", dueDate);
    formData.set("status", status);
    startTransition(async () => {
      const next = entry
        ? await updateFinanceEntryAction(entry.id, { ok: false, message: "" }, formData)
        : await createFinanceEntryAction({ ok: false, message: "" }, formData);
      setResult(next);
      if (next.ok) {
        onOpenChange(false);
        router.refresh();
      }
    });
  };

  const categories = type === "receita" ? ["Avulso", "Plano", "Outros"] : ["Aluguel", "Materiais", "Serviços", "Outros"];
  const placeholder = type === "receita" ? "Ex.: Sessão semanal" : "Ex.: Aluguel do consultório";

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
      <DialogHeader><DialogTitle>{entry ? "Editar lançamento" : "Registro financeiro"}</DialogTitle><DialogDescription>Preencha os dados do lançamento financeiro.</DialogDescription></DialogHeader>
      <Tabs value={type} onValueChange={(next) => setType(next as typeof type)}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="receita" disabled={Boolean(entry)}><TrendingUp className="mr-1 size-4" /> Receita</TabsTrigger><TabsTrigger value="despesa" disabled={Boolean(entry)}><TrendingDown className="mr-1 size-4" /> Despesa</TabsTrigger></TabsList></Tabs>
      <div className="space-y-4">
        {type === "receita" ? <EditorField label="Paciente (opcional)"><Select value={patient} onValueChange={setPatient} disabled={Boolean(entry)}><SelectTrigger aria-label="Paciente"><SelectValue placeholder="Sem paciente vinculado" /></SelectTrigger><SelectContent>{patients.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></EditorField> : null}
        <EditorField label="Categoria *"><Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Categoria"><SelectValue placeholder="Selecionar categoria..." /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></EditorField>
        <EditorField label="Descrição *"><Input aria-label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={placeholder} /></EditorField>
        <EditorField label="Método"><Select value={method} onValueChange={setMethod}><SelectTrigger aria-label="Método"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="card">Cartão</SelectItem><SelectItem value="cash">Dinheiro</SelectItem><SelectItem value="insurance">Convênio</SelectItem></SelectContent></Select></EditorField>
        <div className="grid gap-3 sm:grid-cols-2"><EditorField label="Valor (R$) *"><Input aria-label="Valor" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="0,00" /></EditorField><EditorField label="Data *"><Input aria-label="Data" inputMode="numeric" value={date} onChange={(event) => setDate(maskDate(event.target.value))} placeholder="dd/mm/aaaa" /></EditorField></div>
        <EditorField label="Vencimento *"><Input aria-label="Vencimento" inputMode="numeric" value={dueDate} onChange={(event) => setDueDate(maskDate(event.target.value))} placeholder="dd/mm/aaaa" /></EditorField>
        {!entry ? <EditorField label="Status"><Select value={status} onValueChange={(next) => setStatus(next as typeof status)}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="previsto">Previsto</SelectItem><SelectItem value="efetivado">Efetivado</SelectItem></SelectContent></Select></EditorField> : null}
      </div>
      {result.message ? <p role="status" className={cn("text-sm", result.ok ? "text-success" : "text-destructive")}>{result.message}</p> : null}
      <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={submit} disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

export function FinanceEntryControls({ entry, onEdit }: { entry: FinanceEntryView; onEdit: () => void }) {
  const router = useRouter();
  const [message, setMessage] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const changeStatus = (status: "efetivado" | "cancelado") => {
    const formData = new FormData();
    formData.set("entryId", entry.id);
    formData.set("status", status);
    startTransition(async () => {
      const next = await setFinanceEntryStatusAction(formData);
      setMessage(next.message);
      if (next.ok) router.refresh();
    });
  };
  if (entry.status === "cancelado") return null;
  return <div className="flex flex-wrap justify-end gap-1"><Button variant="ghost" size="icon" aria-label="Editar lançamento" onClick={onEdit} disabled={isPending}><Edit3 className="size-4" /></Button><Button variant="ghost" size="icon" aria-label="Cancelar lançamento" className="text-destructive" onClick={() => changeStatus("cancelado")} disabled={isPending}><Trash2 className="size-4" /></Button>{entry.status === "previsto" ? <Button size="icon" aria-label="Efetivar lançamento" onClick={() => changeStatus("efetivado")} disabled={isPending}><Check className="size-4" /></Button> : null}<span className="sr-only" aria-live="polite">{message}</span></div>;
}
