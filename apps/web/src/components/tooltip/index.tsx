"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import {
  TooltipContent,
  type TooltipContentProps,
} from "./tooltip-content";

export type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root> &
  Pick<TooltipContentProps, "align" | "side" | "sideOffset"> & {
    children: React.ReactElement;
    content: React.ReactNode;
    contentClassName?: string;
  };

function TooltipComponent({
  align,
  children,
  content,
  contentClassName,
  side,
  sideOffset,
  ...rootProps
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root {...rootProps}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={contentClassName}
      >
        {content}
      </TooltipContent>
    </TooltipPrimitive.Root>
  );
}

export const Tooltip = Object.assign(TooltipComponent, {
  Content: TooltipContent,
  Provider: TooltipPrimitive.Provider,
  Root: TooltipPrimitive.Root,
  Trigger: TooltipPrimitive.Trigger,
});

export { TooltipContent } from "./tooltip-content";
