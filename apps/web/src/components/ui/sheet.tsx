"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }) {
  const sideClasses = { top: "inset-x-0 top-0 border-b", right: "inset-y-0 right-0 h-full w-[min(90vw,24rem)] border-l", bottom: "inset-x-0 bottom-0 border-t", left: "inset-y-0 left-0 h-full w-[min(90vw,24rem)] border-r" };
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <SheetPrimitive.Content className={cn("fixed z-50 bg-card p-6 text-card-foreground shadow-xl outline-none transition duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out", side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left", side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right", sideClasses[side], className)} {...props}>
        {children}
        <SheetPrimitive.Close className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-md hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <X aria-hidden="true" className="size-4" /><span className="sr-only">Fechar</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("grid gap-2", className)} {...props} />;
const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => <div className={cn("mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
const SheetTitle = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) => <SheetPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
const SheetDescription = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) => <SheetPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };
