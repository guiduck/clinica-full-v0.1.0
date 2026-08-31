"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;
const AccordionItem = ({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) => <AccordionPrimitive.Item className={cn("border-b", className)} {...props} />;
const AccordionTrigger = ({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger className={cn("flex min-h-11 flex-1 items-center justify-between gap-4 py-3 text-left text-sm font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring [&[data-state=open]>svg]:rotate-180", className)} {...props}>
      {children}<ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
const AccordionContent = ({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) => <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}><div className={cn("pb-4 pt-1", className)}>{children}</div></AccordionPrimitive.Content>;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
