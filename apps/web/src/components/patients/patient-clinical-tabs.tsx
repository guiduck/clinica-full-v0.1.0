"use client";

import * as React from "react";
import { FileText, Plus, Save } from "lucide-react";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

const clinicalUnavailable = {
  key: "patients.clinical-save",
  mode: "unavailable" as const,
  affectedAction: "save" as const,
  title: "Prontuário seguro ainda não conectado",
  message: "O preenchimento desta tela é apenas uma revisão do fluxo. Nenhum conteúdo clínico foi salvo, transmitido ou incluído em logs.",
};

const sections = [
  { id: "hda", title: "Histórico da Queixa (HDA)", fields: [
    { key: "description", label: "Descrição detalhada", textarea: true },
    { key: "precipitants", label: "Fatores precipitantes" },
    { key: "previousAttempts", label: "Tentativas prévias de tratamento" },
  ] },
  { id: "personal", title: "Histórico Pessoal, Familiar e Social", fields: [
    { key: "narrative", label: "Relato livre", textarea: true, placeholder: "Descreva o histórico pessoal, desenvolvimento, configuração familiar e dinâmica social." },
    { key: "supportNetwork", label: "Rede de apoio" },
  ] },
  { id: "habits", title: "Hábitos e Estilo de Vida", fields: [
    { key: "sleep", label: "Sono" }, { key: "diet", label: "Alimentação" },
    { key: "physicalActivity", label: "Atividade física" }, { key: "alcohol", label: "Álcool" },
    { key: "tobacco", label: "Tabaco" }, { key: "drugs", label: "Drogas" },
    { key: "leisure", label: "Lazer e espiritualidade" },
  ] },
  { id: "mental", title: "Exame do Estado Mental (EEM)", fields: [
    { key: "appearance", label: "Aparência" }, { key: "attitude", label: "Atitude" },
    { key: "consciousness", label: "Consciência" }, { key: "affect", label: "Afeto" },
    { key: "thought", label: "Pensamento" },
  ] },
  { id: "diagnosis", title: "Hipótese Diagnóstica e Plano Terapêutico", fields: [
    { key: "cidDsm", label: "Impressão CID-11 / DSM-5 (referência manual)" },
    { key: "objectives", label: "Objetivos do tratamento", textarea: true },
  ] },
] as const;

type Draft = Record<string, Record<string, string>>;

export function PatientAnamneseTab() {
  const [draft, setDraft] = React.useState<Draft>({});
  const total = sections.reduce((sum, section) => sum + section.fields.length, 0);
  const filled = sections.reduce((sum, section) => sum + section.fields.filter((field) => draft[section.id]?.[field.key]?.trim()).length, 0);
  const completion = Math.round((filled / total) * 100);

  const change = (section: string, field: string, value: string) => {
    setDraft((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  };

  return <div className="space-y-4">
    <Card className="sticky top-16 z-20 p-5">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-2 flex justify-between text-sm"><span className="font-medium">Progresso da anamnese</span><span className="text-muted-foreground">{completion}%</span></div>
          <Progress value={completion} />
        </div>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">{filled ? "Rascunho local não salvo" : "Pronto para preencher"}</span>
        <CapabilityNotice descriptor={clinicalUnavailable} trigger={<Button size="sm"><Save className="size-4" />Salvar</Button>} />
      </div>
    </Card>
    <Card className="p-2">
      <Accordion type="multiple" defaultValue={[sections[0].id]}>
        {sections.map((section) => {
          const sectionFilled = section.fields.filter((field) => draft[section.id]?.[field.key]?.trim()).length;
          const percentage = Math.round((sectionFilled / section.fields.length) * 100);
          return <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="px-4 hover:no-underline"><span className="flex w-full items-center justify-between pr-4"><span>{section.title}</span><Badge tone="neutral">{percentage}%</Badge></span></AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => <div key={field.key} className={"textarea" in field && field.textarea ? "sm:col-span-2" : ""}>
                  <Label htmlFor={`anamnese-${section.id}-${field.key}`}>{field.label}</Label>
                  {"textarea" in field && field.textarea
                    ? <Textarea id={`anamnese-${section.id}-${field.key}`} className="mt-1.5 min-h-28" placeholder={"placeholder" in field ? field.placeholder : undefined} value={draft[section.id]?.[field.key] ?? ""} onChange={(event) => change(section.id, field.key, event.target.value)} />
                    : <Input id={`anamnese-${section.id}-${field.key}`} className="mt-1.5" value={draft[section.id]?.[field.key] ?? ""} onChange={(event) => change(section.id, field.key, event.target.value)} />}
                </div>)}
              </div>
            </AccordionContent>
          </AccordionItem>;
        })}
      </Accordion>
    </Card>
  </div>;
}

type EvolutionDraft = { date: string; mood: number; free: string; subjective: string; objective: string; assessment: string; plan: string };

export function PatientClinicalRecordTab() {
  const [open, setOpen] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const [draft, setDraft] = React.useState<EvolutionDraft>(() => ({
    date: new Date().toISOString().slice(0, 16), mood: 5, free: "", subjective: "", objective: "", assessment: "", plan: "",
  }));
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Evoluções clínicas</h2><p className="text-sm text-muted-foreground">Registro livre e/ou estruturado (SOAP) por sessão</p></div><Button onClick={() => setOpen(true)}><Plus className="size-4" />Nova evolução</Button></div>
    <Card className="p-12 text-center"><FileText className="mx-auto size-10 text-muted-foreground/50" /><h3 className="mt-3 font-medium">Nenhuma evolução registrada</h3><p className="mt-1 text-sm text-muted-foreground">Comece registrando a primeira sessão deste paciente.</p><Button className="mt-4" onClick={() => setOpen(true)}>Criar primeira evolução</Button></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Nova evolução</DialogTitle><DialogDescription>O rascunho permanece somente nesta janela até que a persistência clínica seja liberada.</DialogDescription></DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="evolution-date">Data e hora</Label><Input id="evolution-date" className="mt-1.5" type="datetime-local" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></div><div><Label>Humor relatado: <strong>{draft.mood}/10</strong></Label><Slider className="mt-4" min={1} max={10} step={1} value={[draft.mood]} onValueChange={([mood]) => setDraft({ ...draft, mood })} /></div></div>
        <div><Label htmlFor="evolution-free">Registro livre</Label><Textarea id="evolution-free" className="mt-1.5 min-h-44" placeholder="Descreva o que aconteceu na sessão, observações clínicas e plano..." value={draft.free} onChange={(event) => setDraft({ ...draft, free: event.target.value })} /></div>
        <Accordion type="single" collapsible><AccordionItem value="soap" className="rounded-md border"><AccordionTrigger className="px-4 hover:no-underline">Registro estruturado (SOAP) — opcional</AccordionTrigger><AccordionContent className="space-y-3 px-4">
          {([["subjective", "S", "Subjetivo"], ["objective", "O", "Objetivo"], ["assessment", "A", "Avaliação"], ["plan", "P", "Plano"]] as const).map(([key, letter, label]) => <div key={key}><Label htmlFor={`soap-${key}`} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground">{letter}</span>{label}</Label><Textarea id={`soap-${key}`} className="mt-1.5" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></div>)}
        </AccordionContent></AccordionItem></Accordion>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => setBlocked(true)}><Save className="size-4" />Salvar evolução</Button></DialogFooter>
    </DialogContent></Dialog>
    <CapabilityNotice descriptor={clinicalUnavailable} open={blocked} onOpenChange={setBlocked} />
  </div>;
}
