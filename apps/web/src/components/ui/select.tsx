"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  indicator?: React.ReactNode;
};
const SelectTrigger = ({ className, children, indicator, ...props }: SelectTriggerProps) => <SelectPrimitive.Trigger className={cn("flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50", className)} {...props}>{children}<SelectPrimitive.Icon>{indicator ?? <ChevronDown aria-hidden="true" className="size-4 opacity-60" />}</SelectPrimitive.Icon></SelectPrimitive.Trigger>;
const SelectContent = ({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) => <SelectPrimitive.Portal><SelectPrimitive.Content position={position} className={cn("z-50 max-h-72 w-[var(--radix-select-trigger-width)] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg", className)} {...props}><SelectPrimitive.Viewport className="w-full p-1">{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>;
const SelectLabel = ({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) => <SelectPrimitive.Label className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />;
const SelectItem = ({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) => <SelectPrimitive.Item className={cn("relative flex min-h-11 cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none focus:bg-accent data-[disabled]:opacity-50", className)} {...props}><span className="absolute left-2 flex size-4 items-center justify-center"><SelectPrimitive.ItemIndicator><Check aria-hidden="true" className="size-4" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>;
const SelectSeparator = ({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) => <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
