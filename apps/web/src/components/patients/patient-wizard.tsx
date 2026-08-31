"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, CreditCard, Save, Wallet } from "lucide-react";
import { createPatientWizardAction } from "@/actions/patients";
import { upsertPatientFinancialProfileAction } from "@/actions/patient-financial-profile";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { maskBrazilianDate, maskBrl, maskCpf, maskPhone } from "@/utils/masks";
import { cn } from "@/lib/utils";

type PatientDraft = {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
  whatsappConsent: boolean;
  emailConsent: boolean;
};
const INITIAL: PatientDraft = {
  name: "", cpf: "", birthDate: "", email: "", phone: "", status: "ativo", notes: "",
  whatsappConsent: true, emailConsent: true,
};
const toIsoDate = (date: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : date;
};

export function PatientWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [draft, setDraft] = React.useState(INITIAL);
  const [billing, setBilling] = React.useState<"avulso" | "plano">("avulso");
  const [price, setPrice] = React.useState("");
  const [method, setMethod] = React.useState("pix");
  const [pixType, setPixType] = React.useState("cpf");
  const [pixKey, setPixKey] = React.useState("");
  const [welcome, setWelcome] = React.useState(true);
  const [contract, setContract] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [created, setCreated] = React.useState<{ id: string; name: string } | null>(null);

  const update = <K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const validateStepOne = () => {
    if (draft.name.trim().length < 2) return "Informe o nome completo.";
    if (draft.cpf.replace(/\D/g, "").length !== 11) return "Informe um CPF válido.";
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(draft.birthDate)) return "Informe a data de nascimento em dd/mm/aaaa.";
    if (!draft.email.includes("@")) return "Informe um e-mail válido.";
    if (![10, 11].includes(draft.phone.replace(/\D/g, "").length)) return "Informe um telefone válido.";
    return "";
  };
  const next = () => {
    const issue = validateStepOne();
    if (issue) return setError(issue);
    setError("");
    setStep(2);
  };
  const save = () => {
    if (billing === "plano") {
      setError("O cadastro com plano será conectado quando o service de planos estiver disponível. Selecione Avulso para salvar agora.");
      return;
    }
    if (!price.replace(/\D/g, "")) return setError("Informe o valor por sessão.");
    if (method === "pix" && !pixKey.trim()) return setError("Informe a chave PIX para concluir os dados de pagamento.");
    setError("");
    startTransition(async () => {
      const patientData = new FormData();
      patientData.set("name", draft.name);
      patientData.set("cpf", draft.cpf);
      patientData.set("birthDate", toIsoDate(draft.birthDate));
      patientData.set("email", draft.email);
      patientData.set("phone", draft.phone);
      patientData.set("notes", draft.notes);
      if (draft.whatsappConsent) patientData.set("whatsappConsent", "on");
      const result = await createPatientWizardAction(patientData);
      if (!result.ok) return setError(result.message);

      const financial = new FormData();
      financial.set("preferredPaymentMethod", method);
      financial.set("defaultSessionPrice", String(Number(price.replace(/\D/g, "")) / 100));
      if (method === "pix") {
        financial.set("pixKeyType", pixType);
        financial.set("pixKey", pixKey);
      }
      const financeResult = await upsertPatientFinancialProfileAction(result.patientId, { ok: false, message: "" }, financial);
      if (!financeResult.ok) return setError(financeResult.message);
      setCreated({ id: result.patientId, name: result.patientName });
      router.refresh();
    });
  };
  const close = () => {
    if (pending) return;
    setStep(1); setDraft(INITIAL); setPrice(""); setPixKey(""); setError("");
    onOpenChange(false);
  };
  return (
    <>
      <Dialog open={open && !created} onOpenChange={(value) => { if (!value) close(); }}>
        <DialogContent className="max-w-2xl p-0">
          <div className="p-6">
            <DialogHeader><DialogTitle>Novo paciente</DialogTitle><DialogDescription className="sr-only">Cadastro de dados e pagamento do paciente</DialogDescription></DialogHeader>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <Step number={1} label="Dados" active={step === 1} complete={step === 2} />
              <span className="text-muted-foreground">›</span>
              <Step number={2} label="Pagamento" active={step === 2} />
              <span className="text-muted-foreground">›</span>
              <Step number={3} label="Cobrança" locked />
            </div>
          </div>
          <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto px-6 pb-6">
            {step === 1 ? (
              <div className="space-y-5">
                <FormSection title="Dados pessoais"><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome completo *"><Input value={draft.name} onChange={(e) => update("name", e.target.value)} /></Field><Field label="CPF *"><Input inputMode="numeric" value={draft.cpf} onChange={(e) => update("cpf", maskCpf(e.target.value))} placeholder="000.000.000-00" /></Field><Field label="Data de nascimento *"><Input inputMode="numeric" value={draft.birthDate} onChange={(e) => update("birthDate", maskBrazilianDate(e.target.value))} placeholder="dd/mm/aaaa" /></Field></div></FormSection>
                <FormSection title="Contato"><div className="grid gap-4 sm:grid-cols-2"><Field label="E-mail *"><Input type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} /></Field><Field label="Telefone / WhatsApp *"><Input inputMode="tel" value={draft.phone} onChange={(e) => update("phone", maskPhone(e.target.value))} placeholder="(11) 90000-0000" /></Field></div></FormSection>
                <FormSection title="Clínico"><Field label="Status"><Select value={draft.status} onValueChange={(value) => update("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem><SelectItem value="arquivado">Arquivado</SelectItem></SelectContent></Select></Field><Field label="Queixa principal"><Textarea value={draft.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Motivo da busca..." /></Field></FormSection>
                <Disclosure title="Endereço (opcional)" subtitle="necessário para o preenchimento automático do contrato" />
                <Disclosure title="Contato de emergência (opcional)" />
                <div><p className="mb-2 text-sm font-medium">Consentimento de comunicação</p><label className="flex items-center gap-2 text-sm"><Checkbox checked={draft.whatsappConsent} onCheckedChange={(value) => update("whatsappConsent", value === true)} />Aceita receber lembretes por WhatsApp</label><label className="mt-2 flex items-center gap-2 text-sm"><Checkbox checked={draft.emailConsent} onCheckedChange={(value) => update("emailConsent", value === true)} />Aceita receber comunicações por e-mail</label></div>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm leading-6 text-muted-foreground">Escolha o plano ou o valor por sessão combinado com o paciente, e depois o método de pagamento. A receita é registrada automaticamente no financeiro após o cadastro.</p>
                <Field label="Modelo de cobrança"><div className="grid grid-cols-2 rounded-lg bg-muted p-1"><button onClick={() => setBilling("avulso")} className={cn("flex min-h-10 items-center justify-center gap-2 rounded-md text-sm", billing === "avulso" && "bg-card shadow-sm")}><CreditCard className="size-4" />Avulso</button><button onClick={() => setBilling("plano")} className={cn("flex min-h-10 items-center justify-center gap-2 rounded-md text-sm", billing === "plano" && "bg-card shadow-sm")}><Wallet className="size-4" />Plano</button></div></Field>
                <Field label="Valor por sessão (R$)"><Input inputMode="numeric" value={price} onChange={(e) => setPrice(maskBrl(e.target.value))} placeholder="Ex.: 250,00" /></Field>
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Cada atendimento gera uma cobrança individual com este valor de referência. Você pode ajustá-lo em cada sessão.</div>
                <Field label="Método de pagamento"><Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="cash">Dinheiro</SelectItem><SelectItem value="card">Cartão</SelectItem><SelectItem value="insurance">Convênio</SelectItem></SelectContent></Select></Field>
                {method === "pix" ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Tipo da chave PIX"><Select value={pixType} onValueChange={setPixType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cpf">CPF</SelectItem><SelectItem value="email">E-mail</SelectItem><SelectItem value="phone">Telefone</SelectItem><SelectItem value="random">Aleatória</SelectItem></SelectContent></Select></Field><Field label="Chave PIX"><Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} /></Field></div> : null}
                <div className="rounded-lg border bg-subtle/60 p-3 text-xs text-muted-foreground">Nenhum dado sensível (chave PIX, cartão) é exposto fora do perfil financeiro. O envio automático de links de cobrança estará disponível em planos superiores.</div>
                <div className="border-t pt-4"><label className="flex items-start gap-2"><Checkbox checked={welcome} onCheckedChange={(value) => setWelcome(value === true)} /><span><span className="text-sm">Enviar mensagem de boas-vindas ao paciente</span><span className="block text-xs text-muted-foreground">A mensagem só será enviada quando o serviço de mensagens estiver conectado.</span></span></label><label className="mt-3 flex items-start gap-2"><Checkbox checked={contract} onCheckedChange={(value) => setContract(value === true)} /><span><span className="text-sm">Enviar contrato padrão para assinatura</span><span className="block text-xs text-muted-foreground">O contrato será preparado, mas o envio permanece indisponível.</span></span></label></div>
              </div>
            )}
            {error ? <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t bg-background pt-4"><Button variant="outline" onClick={close}>Cancelar</Button>{step === 2 ? <Button variant="outline" onClick={() => { setError(""); setStep(1); }}>Voltar</Button> : null}{step === 1 ? <Button onClick={next}>Próximo</Button> : <Button onClick={save} disabled={pending}><Save className="size-4" />{pending ? "Salvando..." : "Salvar paciente"}</Button>}</div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(created)} onOpenChange={(value) => { if (!value) { setCreated(null); close(); } }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Paciente cadastrado com sucesso</AlertDialogTitle><AlertDialogDescription>{created?.name} foi adicionado. Deseja já criar um agendamento para este paciente?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => { setCreated(null); close(); }}>Agora não</AlertDialogCancel><AlertDialogAction onClick={() => router.push(`/agenda?new=1&patientId=${created?.id}`)}>Sim, agendar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Step({ number, label, active, complete, locked }: { number: number; label: string; active?: boolean; complete?: boolean; locked?: boolean }) {
  return <div className={cn("flex items-center gap-2", locked && "opacity-45")}><span className={cn("grid size-6 place-items-center rounded-full bg-muted text-xs", active && "bg-primary text-primary-foreground", complete && "bg-success text-success-foreground")}>{complete ? <Check className="size-3.5" /> : number}</span><span className={cn("text-xs", active && "font-medium text-primary")}>{label}</span></div>;
}
function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <section><h3 className="mb-3 text-sm font-semibold">{title}</h3><div className="space-y-4">{children}</div></section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId();
  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, { id, "aria-label": label })
    : children;
  return <div className="grid gap-1.5"><Label htmlFor={id}>{label}</Label>{control}</div>;
}
function Disclosure({ title, subtitle }: { title: string; subtitle?: string }) { return <button type="button" className="flex min-h-12 w-full items-center rounded-lg border px-3 text-left text-sm font-medium"><span className="flex-1">{title}{subtitle ? <span className="ml-2 font-normal text-muted-foreground">— {subtitle}</span> : null}</span><ChevronDown className="size-4" /></button>; }
