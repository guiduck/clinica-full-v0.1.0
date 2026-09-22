"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseBrazilianDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12);
  return date.getFullYear() === Number(match[3]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[1])
    ? date
    : null;
}

export function DatePickerInput({
  id,
  value,
  onValueChange,
  minDate,
  "aria-label": ariaLabel = "Selecionar data",
}: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  minDate?: Date;
  "aria-label"?: string;
}) {
  const selected = parseBrazilianDate(value);
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(() => startOfMonth(selected ?? minDate ?? new Date()));
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
  });
  const minimum = minDate ? startOfDay(minDate) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className={cn("mt-1.5 w-full justify-between font-normal", !selected && "text-muted-foreground")}
        >
          {selected ? format(selected, "dd/MM/yyyy") : "Selecione uma data"}
          <CalendarDays className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="mb-3 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => setMonth((current) => subMonths(current, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <strong className="text-sm capitalize">{format(month, "MMMM 'de' yyyy", { locale: ptBR })}</strong>
          <Button type="button" variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => setMonth((current) => addMonths(current, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((label, index) => <span key={`${label}-${index}`} className="py-1">{label}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const disabled = Boolean(minimum && isBefore(day, minimum));
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                aria-label={format(day, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                aria-pressed={Boolean(selected && isSameDay(day, selected))}
                onClick={() => {
                  onValueChange(format(day, "dd/MM/yyyy"));
                  setOpen(false);
                }}
                className={cn(
                  "grid size-9 place-items-center rounded-md text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
                  !isSameMonth(day, month) && "text-muted-foreground/60",
                  selected && isSameDay(day, selected) && "bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
