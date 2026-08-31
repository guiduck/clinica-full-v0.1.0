"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;
const FormFieldContext = React.createContext<{ name: string }>({ name: "" });
function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(props: ControllerProps<TFieldValues, TName>) {
  return <FormFieldContext.Provider value={{ name: props.name }}><Controller {...props} /></FormFieldContext.Provider>;
}
const FormItemContext = React.createContext<{ id: string }>({ id: "" });
function FormItem({ className, ...props }: React.ComponentProps<"div">) { const id = React.useId(); return <FormItemContext.Provider value={{ id }}><div className={cn("grid gap-2", className)} {...props} /></FormItemContext.Provider>; }
function useFormField() { const field = React.useContext(FormFieldContext); const item = React.useContext(FormItemContext); const { getFieldState, formState } = useFormContext(); const state = getFieldState(field.name, formState); return { ...state, name: field.name, formItemId: `${item.id}-item`, formDescriptionId: `${item.id}-description`, formMessageId: `${item.id}-message` }; }
function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) { const { error, formItemId } = useFormField(); return <Label htmlFor={formItemId} className={cn(error && "text-destructive", className)} {...props} />; }
function FormControl(props: React.ComponentProps<typeof Slot.Slot>) { const { error, formItemId, formDescriptionId, formMessageId } = useFormField(); return <Slot.Slot id={formItemId} aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId} aria-invalid={Boolean(error)} {...props} />; }
function FormDescription({ className, ...props }: React.ComponentProps<"p">) { const { formDescriptionId } = useFormField(); return <p id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />; }
function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) { const { error, formMessageId } = useFormField(); const body = error ? String(error.message ?? "Campo inválido.") : children; return body ? <p id={formMessageId} role="alert" className={cn("text-sm font-medium text-destructive", className)} {...props}>{body}</p> : null; }
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField };
