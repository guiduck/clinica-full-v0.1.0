"use client";

import * as React from "react";
import { CheckCircle2, Download, Eraser, FileSignature, FileText, Save, Upload } from "lucide-react";
import { CapabilityNotice } from "@/components/feedback/capability-notice";
import { DiscardConfirmation } from "@/components/feedback/discard-confirmation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDiscardConfirmation } from "@/hooks/use-discard-confirmation";
import { formatBrazilianDate } from "@/utils/formatters";

const unavailable = {
  key: "patients.documents-write",
  mode: "unavailable" as const,
  affectedAction: "save" as const,
  title: "Repositório de documentos ainda não conectado",
  message: "Nenhum arquivo, PDF, documento ou assinatura foi salvo. O conteúdo desta tela é descartado ao fechar.",
};

const templates = [
  ["atestado", "Atestado", "Atestado de comparecimento"],
  ["laudo", "Laudo", "Relatório ou laudo psicológico"],
  ["encaminhamento", "Encaminhamento", "Encaminhamento a outro profissional"],
  ["receituario", "Receituário", "Modelo de orientação clínica"],
  ["pedido", "Pedido de exame", "Solicitação editável"],
  ["contrato", "Contrato", "Prestação de serviços psicoterapêuticos"],
] as const;

export function PatientDocumentsTab({ patientName, onDirtyChange }: { patientName: string; onDirtyChange?: (dirty: boolean) => void }) {
  const [editor, setEditor] = React.useState<{ title: string; content: string } | null>(null);
  const [preview, setPreview] = React.useState(false);
  const [signature, setSignature] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const discard = useDiscardConfirmation(editor !== null);

  React.useEffect(() => {
    onDirtyChange?.(editor !== null);
    return () => onDirtyChange?.(false);
  }, [editor, onDirtyChange]);

  const closeEditor = React.useCallback(() => {
    setEditor(null);
    setPreview(false);
    setSignature(false);
  }, []);
  const requestCloseEditor = () => discard.requestDiscard(closeEditor);

  const create = (title: string) => setEditor({ title, content: `Paciente: ${patientName}\nData: ${formatBrazilianDate(new Date())}\n\nTexto editável conforme o modelo "${title}".` });
  return <div className="space-y-4">
    <Card className="p-5"><h2 className="mb-3 font-semibold">Modelos rápidos</h2><div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">{templates.map(([, title, description]) => <button type="button" key={title} onClick={() => create(title)} className="min-h-28 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent/30"><FileText className="mb-2 size-5 text-primary" /><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></button>)}</div></Card>
    <Card className="p-5"><h2 className="mb-3 font-semibold">Upload</h2><div className="rounded-lg border-2 border-dashed p-8 text-center"><Upload className="mx-auto size-8 text-muted-foreground" /><p className="mt-2 text-sm font-medium">Arraste arquivos ou clique para enviar</p><p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG · até 10 MB</p><input ref={fileRef} className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={() => setBlocked(true)} /><Button className="mt-3" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>Selecionar arquivo</Button></div></Card>
    <Card className="p-5"><h2 className="mb-3 font-semibold">Documentos do paciente</h2><div className="py-8 text-center"><Badge tone="neutral"><CheckCircle2 className="mr-1 size-3" />Repositório protegido</Badge><p className="mt-3 text-sm text-muted-foreground">Nenhum documento ainda.</p></div></Card>
    <Dialog open={editor !== null} onOpenChange={(next) => { if (!next) requestCloseEditor(); }}><DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0"><DialogHeader className="border-b px-6 pb-4 pt-6"><div className="flex items-center gap-3"><DialogTitle className="flex-1">{preview ? editor?.title : <Input aria-label="Título do documento" value={editor?.title ?? ""} onChange={(event) => editor && setEditor({ ...editor, title: event.target.value })} />}</DialogTitle><Button variant="outline" size="sm" onClick={() => setPreview((value) => !value)}>{preview ? "Editar" : "Pré-visualizar"}</Button></div><DialogDescription className="sr-only">Editor e pré-visualização do documento</DialogDescription></DialogHeader>
      <div className="flex-1 overflow-y-auto px-6 py-4">{preview ? <div className="min-h-96 rounded-lg border bg-white p-10 text-slate-900 shadow-inner"><p className="border-b pb-2 text-xs text-slate-500">Documento clínico</p><h3 className="my-6 text-center text-lg font-bold">{editor?.title}</h3><p className="whitespace-pre-wrap text-sm leading-7">{editor?.content}</p></div> : <Textarea aria-label="Conteúdo do documento" className="min-h-96" value={editor?.content ?? ""} onChange={(event) => editor && setEditor({ ...editor, content: event.target.value })} />}</div>
      <DialogFooter className="border-t bg-background px-6 py-4"><Button variant="outline" onClick={() => setBlocked(true)}><Download className="size-4" />PDF</Button><Button variant="outline" onClick={() => setSignature(true)}><FileSignature className="size-4" />Assinar</Button><Button onClick={() => setBlocked(true)}><Save className="size-4" />Salvar</Button></DialogFooter>
    </DialogContent></Dialog>
    <SignatureDialog open={signature} onOpenChange={setSignature} onBlocked={() => setBlocked(true)} />
    <DiscardConfirmation open={discard.open} onCancel={discard.cancelDiscard} onConfirm={discard.confirmDiscard} />
    <CapabilityNotice descriptor={unavailable} open={blocked} onOpenChange={setBlocked} />
  </div>;
}

function SignatureDialog({ open, onOpenChange, onBlocked }: { open: boolean; onOpenChange: (open: boolean) => void; onBlocked: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [drawn, setDrawn] = React.useState(false);
  const discard = useDiscardConfirmation(drawn);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => { const context = canvasRef.current?.getContext("2d"); const position = point(event); if (!context || !position) return; drawing.current = true; setDrawn(true); event.currentTarget.setPointerCapture(event.pointerId); context.beginPath(); context.moveTo(position.x, position.y); };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const context = canvasRef.current?.getContext("2d"); const position = point(event); if (!context || !position) return; context.lineTo(position.x, position.y); context.strokeStyle = "#102033"; context.lineWidth = 2; context.stroke(); };
  const clear = React.useCallback(() => { const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height); setDrawn(false); }, []);
  const close = React.useCallback(() => { clear(); onOpenChange(false); }, [clear, onOpenChange]);
  const requestClose = () => discard.requestDiscard(close);
  return <><Dialog open={open} onOpenChange={(next) => { if (next) onOpenChange(true); else requestClose(); }}><DialogContent><DialogHeader><DialogTitle>Assinatura eletrônica simples</DialogTitle><DialogDescription>Este preview mostra as evidências previstas. A assinatura não será aplicada nem armazenada.</DialogDescription></DialogHeader><canvas ref={canvasRef} width={600} height={180} aria-label="Área para desenhar assinatura" className="h-36 w-full touch-none rounded-lg border border-dashed bg-muted/20" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} /><div className="flex justify-end"><Button variant="ghost" size="sm" disabled={!drawn} onClick={clear}><Eraser className="size-4" />Apagar assinatura</Button></div><div className="rounded-md bg-muted/40 p-3 text-xs"><p><span className="text-muted-foreground">Data:</span> {new Date().toLocaleString("pt-BR")}</p><p><span className="text-muted-foreground">IP e sessão:</span> registrados apenas quando o serviço seguro existir</p><p><span className="text-muted-foreground">Versão:</span> 1</p></div><DialogFooter><Button variant="outline" onClick={requestClose}>Cancelar</Button><Button disabled={!drawn} onClick={onBlocked}>Aplicar assinatura</Button></DialogFooter></DialogContent></Dialog><DiscardConfirmation open={discard.open} onCancel={discard.cancelDiscard} onConfirm={discard.confirmDiscard} /></>;
}
