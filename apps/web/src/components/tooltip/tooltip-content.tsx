"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export type TooltipContentProps = React.ComponentProps<
  typeof TooltipPrimitive.Content
>;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
