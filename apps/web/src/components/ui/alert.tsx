import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-md border p-4 text-sm leading-6", {
  variants: {
    variant: {
      default: "border-border bg-card text-card-foreground",
      destructive: "border-[#f0b7b0] bg-[#fff4f2] text-destructive",
      success: "border-[#b8ddcd] bg-[#f0fbf6] text-[#1f6d4f]"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-semibold leading-none", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("leading-6", className)} {...props} />
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
