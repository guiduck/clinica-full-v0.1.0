"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn("peer size-5 shrink-0 rounded-sm border border-input bg-background shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center text-current"><Check className="size-3.5" /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
);
Checkbox.displayName = "Checkbox";
export { Checkbox };
export type { CheckboxProps };
