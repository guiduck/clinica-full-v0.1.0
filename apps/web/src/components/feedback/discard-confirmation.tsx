"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type DiscardConfirmationProps = Readonly<{ open: boolean; onCancel: () => void; onConfirm: () => void }>;
export function DiscardConfirmation({ open, onCancel, onConfirm }: DiscardConfirmationProps) {
  return <Dialog open={open} onOpenChange={(next) => { if (!next) onCancel(); }}><DialogContent showCloseButton={false}><DialogHeader><DialogTitle>Descartar conteúdo não salvo?</DialogTitle><DialogDescription>Este conteúdo existe somente nesta tela e não poderá ser recuperado depois que você sair.</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Continuar editando</Button><Button type="button" onClick={onConfirm}>Descartar e sair</Button></DialogFooter></DialogContent></Dialog>;
}
