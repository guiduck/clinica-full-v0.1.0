"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { CapabilityDescriptor } from "@/types/capabilities";

export type CapabilityNoticeProps = Readonly<{ descriptor: CapabilityDescriptor; trigger?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
export function CapabilityNotice({ descriptor, trigger, open, onOpenChange }: CapabilityNoticeProps) {
  return <Dialog open={open} onOpenChange={onOpenChange}>{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}<DialogContent data-capability-key={descriptor.key}><DialogHeader><div className="mb-1 flex size-10 items-center justify-center rounded-full bg-accent text-primary"><Info aria-hidden="true" className="size-5" /></div><DialogTitle>{descriptor.title}</DialogTitle><DialogDescription>{descriptor.message}</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button type="button">Entendi</Button></DialogClose></DialogFooter></DialogContent></Dialog>;
}
