"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Image as ImageIcon,
  MessageSquare,
  Package,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Upload,
} from "lucide-react";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { isValidCpf } from "@/utils/validators/brazilian-documents";
import { maskCep, maskCpf, maskPhone } from "@/utils/masks";
import { useOnboardingTourStore } from "@/components/onboardingTour";
import {
  ONBOARDING_ADVANCE,
  ONBOARDING_CPF_STEP_INDEX,
} from "@/constants/onboarding-tour";
import { useOnboardingTourActions } from "@/hooks/onboarding/use-onboarding-tour-actions";

type Tab = "conta" | "contato" | "planos" | "mensagens" | "seguranca";
type FormState = {
  name: string;
  email: string;
  specialty: string;
  cpf: string;
  council: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  clinicName: string;
  clinicCnpj: string;
  clinicPhone: string;
};
const tabs: ReadonlyArray<{ key: Tab; label: string }> = [
  { key: "conta", label: "Conta" },
  { key: "contato", label: "Contato e endereço" },
  { key: "planos", label: "Planos" },
  { key: "mensagens", label: "Mensagens automáticas" },
  { key: "seguranca", label: "Segurança" },
];
const unavailable = {
  key: "settings-write",
  mode: "unavailable" as const,
  affectedAction: "save" as const,
  title: "Salvamento ainda indisponível",
  message:
    "Os dados foram validados nesta tela, mas o serviço de configurações ainda não está conectado. Nada foi salvo.",
};
function maskCnpj(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, "$1-$2");
}

export function SettingsPage({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const onboardingStep = useOnboardingTourStore((state) => state.step);
  const setOnboardingStepValid = useOnboardingTourStore(
    (state) => state.setStepValid,
  );
  const { advanceFrom } = useOnboardingTourActions();
  const initial = tabs.some((item) => item.key === params.get("tab"))
    ? (params.get("tab") as Tab)
    : "conta";
  const [tab, setTab] = React.useState<Tab>(initial);
  const [blocked, setBlocked] = React.useState(false);
  const [error, setError] = React.useState("");
  const upload = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = React.useState<FormState>({
    name: userName,
    email: userEmail,
    specialty: "",
    cpf: "",
    council: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    clinicName: "",
    clinicCnpj: "",
    clinicPhone: "",
  });
  const changeTab = (value: string) => {
    const next = value as Tab;
    setTab(next);
    const query = new URLSearchParams(params.toString());
    if (next === "conta") query.delete("tab");
    else query.set("tab", next);
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
    if (next === "contato") advanceFrom(ONBOARDING_ADVANCE.CLICK_TARGET);
  };
  const accountSave = () => {
    if (!form.name.trim()) return setError("Nome é obrigatório.");
    if (!form.email.includes("@")) return setError("Informe um e-mail válido.");
    if (!isValidCpf(form.cpf)) return setError("Informe um CPF válido.");
    setError("");
    advanceFrom(ONBOARDING_ADVANCE.ACCOUNT_SAVE);
    setBlocked(true);
  };
  const contactSave = () => {
    const phone = form.phone.replace(/\D/g, "");
    if (![10, 11].includes(phone.length))
      return setError("Informe um telefone brasileiro válido.");
    if (
      !form.street.trim() ||
      !form.city.trim() ||
      form.state.length !== 2 ||
      form.zip.replace(/\D/g, "").length !== 8
    )
      return setError("Preencha o endereço completo com uma UF e CEP válidos.");
    setError("");
    advanceFrom(ONBOARDING_ADVANCE.CONTACT_SAVE);
    setBlocked(true);
  };
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="mt-1 text-muted-foreground">
          Conta, contato, endereço, planos, mensagens e segurança
        </p>
      </header>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Revise os campos</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList
          id="tour-settings-tabs"
          className="h-auto max-w-full justify-start overflow-x-auto"
        >
          {tabs.map((item) => (
            <TabsTrigger
              key={item.key}
              id={`tour-settings-tab-${item.key}`}
              value={item.key}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="conta" className="mt-6 space-y-4">
          <Card className="space-y-4 p-6">
            <h2 className="font-semibold">Dados do profissional</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome *"
                value={form.name}
                onChange={(name) => setForm({ ...form, name })}
              />
              <Field
                label="E-mail *"
                type="email"
                value={form.email}
                onChange={(email) => setForm({ ...form, email })}
              />
              <div id="tour-settings-cpf">
                <Field
                  label="CPF *"
                  value={form.cpf}
                  onChange={(cpf) => {
                    const maskedCpf = maskCpf(cpf);
                    setForm({ ...form, cpf: maskedCpf });
                    if (onboardingStep === ONBOARDING_CPF_STEP_INDEX)
                      setOnboardingStepValid(isValidCpf(maskedCpf));
                  }}
                  placeholder="000.000.000-00"
                />
              </div>
              <Field
                label="Especialidade"
                value={form.specialty}
                onChange={(specialty) => setForm({ ...form, specialty })}
              />
              <Field
                label="Conselho profissional (CRP/CRM)"
                value={form.council}
                onChange={(council) => setForm({ ...form, council })}
                placeholder="Ex.: CRP 06/123456 (opcional)"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Plano: <strong className="text-foreground">Profissional</strong>
            </p>
            <Button
              id="tour-settings-account-save"
              className="w-fit"
              onClick={accountSave}
            >
              <Save className="size-4" /> Salvar
            </Button>
          </Card>
          <Card className="space-y-2 p-6">
            <h2 className="text-sm font-semibold">Privacidade & LGPD</h2>
            <p className="text-xs leading-5 text-muted-foreground">
              O aceite dos Termos de Uso e da Política de Privacidade é
              solicitado no cadastro. Os registros são mantidos internamente
              para fins de auditoria e não são compartilhados publicamente.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="contato" className="mt-6 space-y-4">
          <Card className="space-y-4 p-6">
            <h2 className="font-semibold">Contato</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Telefone / WhatsApp *"
                value={form.phone}
                onChange={(phone) =>
                  setForm({ ...form, phone: maskPhone(phone) })
                }
                placeholder="(11) 90000-0000"
              />
              <Field
                label="E-mail *"
                type="email"
                value={form.email}
                onChange={(email) => setForm({ ...form, email })}
              />
            </div>
          </Card>
          <Card id="tour-settings-address" className="space-y-4 p-6">
            <h2 className="font-semibold">Endereço do consultório</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                className="sm:col-span-2"
                label="Logradouro *"
                value={form.street}
                onChange={(street) => setForm({ ...form, street })}
                placeholder="Rua, número, complemento"
              />
              <Field
                label="Cidade *"
                value={form.city}
                onChange={(city) => setForm({ ...form, city })}
              />
              <Field
                label="UF *"
                value={form.state}
                onChange={(state) =>
                  setForm({ ...form, state: state.toUpperCase().slice(0, 2) })
                }
              />
              <Field
                label="CEP *"
                value={form.zip}
                onChange={(zip) => setForm({ ...form, zip: maskCep(zip) })}
                placeholder="00000-000"
              />
            </div>
          </Card>
          <Card className="p-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="clinica" className="border-0">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <div>
                    <h2 className="font-semibold">
                      Dados da clínica/consultório{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </h2>
                    <p className="font-normal text-muted-foreground">
                      Usados em recibos, contratos e documentos. Se atender como
                      pessoa física, deixe em branco.
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="grid gap-4 pt-4 sm:grid-cols-2">
                  <Field
                    label="Nome da clínica/consultório"
                    value={form.clinicName}
                    onChange={(clinicName) => setForm({ ...form, clinicName })}
                  />
                  <Field
                    label="CNPJ"
                    value={form.clinicCnpj}
                    onChange={(clinicCnpj) =>
                      setForm({ ...form, clinicCnpj: maskCnpj(clinicCnpj) })
                    }
                    placeholder="00.000.000/0000-00"
                  />
                  <Field
                    label="Telefone da clínica/consultório"
                    value={form.clinicPhone}
                    onChange={(clinicPhone) =>
                      setForm({ ...form, clinicPhone: maskPhone(clinicPhone) })
                    }
                    placeholder="(11) 0000-0000"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
          <Card className="space-y-4 p-6">
            <div className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary">
                <ImageIcon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Marca d&apos;água</h2>
                <p className="text-sm text-muted-foreground">
                  Aplicada ao cabeçalho de recibos e documentos gerados. PNG com
                  fundo transparente funciona melhor.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid h-24 w-40 place-items-center rounded-md border bg-muted/30 text-xs text-muted-foreground">
                Sem marca d&apos;água
              </div>
              <input
                ref={upload}
                hidden
                type="file"
                accept="image/*"
                onChange={() => setBlocked(true)}
              />
              <Button variant="outline" onClick={() => upload.current?.click()}>
                <Upload className="size-4" /> Enviar imagem
              </Button>
            </div>
            <Button
              id="tour-settings-save"
              className="w-fit"
              onClick={contactSave}
            >
              <Save className="size-4" /> Salvar
            </Button>
          </Card>
        </TabsContent>
        <TabsContent value="planos" className="mt-6">
          <PlansManager onBlocked={() => setBlocked(true)} />
        </TabsContent>
        <TabsContent value="mensagens" className="mt-6">
          <MessagesManager />
        </TabsContent>
        <TabsContent value="seguranca" className="mt-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
      <CapabilityNotice
        descriptor={unavailable}
        open={blocked}
        onOpenChange={setBlocked}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
function PlansManager({ onBlocked }: { onBlocked: () => void }) {
  const [draft, setDraft] = React.useState({
    name: "",
    description: "",
    sessions: "4",
    months: "1",
    value: "",
  });
  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-6">
        <div className="flex gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-primary">
            <Package className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Planos pré-definidos</h2>
            <p className="text-sm text-muted-foreground">
              Modelos de cobrança recorrente para reutilizar por paciente.
            </p>
          </div>
        </div>
        <p className="py-5 text-center text-sm text-muted-foreground">
          Nenhum plano cadastrado ainda.
        </p>
      </Card>
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Cadastrar novo plano</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome do plano"
            value={draft.name}
            onChange={(name) => setDraft({ ...draft, name })}
            placeholder="Ex.: Plano Semestral Premium"
          />
          <Field
            label="Descrição (opcional)"
            value={draft.description}
            onChange={(description) => setDraft({ ...draft, description })}
          />
          <Field
            label="Sessões por mês"
            type="number"
            value={draft.sessions}
            onChange={(sessions) => setDraft({ ...draft, sessions })}
          />
          <Field
            label="Duração (meses)"
            type="number"
            value={draft.months}
            onChange={(months) => setDraft({ ...draft, months })}
          />
          <Field
            className="sm:col-span-2"
            label="Valor mensal (R$)"
            value={draft.value}
            onChange={(value) => setDraft({ ...draft, value })}
            placeholder="0,00"
          />
        </div>
        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          Resumo: {draft.sessions || 0} sessões/mês × {draft.months || 0} meses.
          O plano só será criado após a conexão do serviço de cobrança.
        </div>
        <Button onClick={onBlocked}>
          <Plus className="size-4" /> Cadastrar plano
        </Button>
      </Card>
    </div>
  );
}

const messageTemplates = [
  {
    key: "welcome",
    label: "Boas-vindas",
    channel: "WHATSAPP",
    body: "Olá {{nomePaciente}}! Seja bem-vindo(a) à clínica.",
  },
  {
    key: "reminder",
    label: "Lembrete de sessão",
    channel: "WHATSAPP",
    body: "Olá {{nomePaciente}}, sua sessão será em {{data}} às {{horario}}.",
  },
  {
    key: "charge",
    label: "Cobrança",
    channel: "WHATSAPP",
    body: "Olá! Sua cobrança de {{valor}} vence em {{vencimento}}.",
  },
  {
    key: "birthday",
    label: "Aniversário",
    channel: "WHATSAPP",
    body: "Feliz aniversário, {{nomePaciente}}!",
  },
  {
    key: "confirmation",
    label: "Confirmação",
    channel: "E-MAIL",
    body: "Sua sessão está confirmada para {{data}}.",
  },
];
function MessagesManager() {
  const [editing, setEditing] = React.useState<
    (typeof messageTemplates)[number] | null
  >(null);
  const [text, setText] = React.useState("");
  const [blocked, setBlocked] = React.useState(false);
  const open = (item: (typeof messageTemplates)[number]) => {
    setEditing(item);
    setText(item.body);
  };
  return (
    <>
      <Card className="space-y-4 p-6">
        <div className="flex gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-primary">
            <MessageSquare className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Templates de mensagem</h2>
            <p className="text-sm text-muted-foreground">
              Escreva o texto padrão de cobranças, lembretes, boas-vindas e
              aniversários.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="font-medium">Como funciona</p>
          <p className="mt-1 text-muted-foreground">
            Use etiquetas como <code>{"{{nomePaciente}}"}</code>,{" "}
            <code>{"{{data}}"}</code> e <code>{"{{valor}}"}</code>. O sistema
            substitui os valores no envio.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {messageTemplates.map((item) => (
            <div
              key={item.key}
              className="flex min-h-44 flex-col rounded-lg border p-4"
            >
              <Badge tone="neutral" className="w-fit">
                {item.channel}
              </Badge>
              <p className="mt-2 font-medium">{item.label}</p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {item.body}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 self-end"
                onClick={() => open(item)}
              >
                Editar
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <Card className="mt-4 space-y-4 p-6">
        <div className="flex gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-primary">
            <Send className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Fila de mensagens automáticas</h2>
            <p className="text-sm text-muted-foreground">
              Mensagens programadas ficam disponíveis no Dashboard para revisão
              antes do envio.
            </p>
          </div>
        </div>
        <p className="py-5 text-center text-sm text-muted-foreground">
          Nenhuma mensagem pendente.
        </p>
      </Card>
      <Dialog
        open={editing !== null}
        onOpenChange={(v) => !v && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {editing?.label}</DialogTitle>
            <DialogDescription>
              Personalize o texto mantendo as etiquetas dinâmicas.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            className="min-h-48"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {["{{nomePaciente}}", "{{data}}", "{{horario}}", "{{valor}}"].map(
              (tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => setText((value) => `${value} ${tag}`)}
                >
                  {tag}
                </Button>
              ),
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={() => setBlocked(true)}>Salvar template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CapabilityNotice
        descriptor={{
          ...unavailable,
          key: "message-template-save",
          message:
            "O texto foi editado apenas nesta janela. O serviço de templates ainda não está conectado e nenhuma mensagem foi alterada ou enviada.",
        }}
        open={blocked}
        onOpenChange={setBlocked}
      />
    </>
  );
}
function SecuritySettings() {
  const [blocked, setBlocked] = React.useState(false);
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary">
            <Smartphone className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">
              Autenticação em dois fatores (2FA)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione uma camada extra de proteção à sua conta.
            </p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setBlocked(true)}
            >
              <ShieldCheck className="size-4" /> Configurar 2FA
            </Button>
          </div>
        </div>
      </Card>
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Comunicação com pacientes</h2>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="opt-whatsapp" className="font-normal">
            Permitir lembretes automáticos por WhatsApp
          </Label>
          <Switch id="opt-whatsapp" defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="opt-email" className="font-normal">
            Permitir notificações por e-mail
          </Label>
          <Switch id="opt-email" defaultChecked />
        </div>
      </Card>
      <CapabilityNotice
        descriptor={{
          ...unavailable,
          key: "two-factor",
          title: "2FA em preparação",
          message:
            "A configuração de autenticação em dois fatores ainda não está conectada. A segurança atual da conta não foi alterada.",
        }}
        open={blocked}
        onOpenChange={setBlocked}
      />
    </div>
  );
}
