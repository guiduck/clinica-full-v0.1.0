import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger" | "muted" | "neutral";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  const tones = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    muted: "bg-muted text-muted-foreground",
    neutral: "bg-muted text-muted-foreground"
  };

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-md px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
