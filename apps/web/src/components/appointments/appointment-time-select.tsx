"use client";

import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPOINTMENT_TIME_OPTIONS,
  isAppointmentTimeAfter,
} from "@/components/appointments/appointment-time-options";

type AppointmentTimeSelectProps = Readonly<{
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  minimumExclusive?: string;
}>;

export function AppointmentTimeSelect({
  id,
  label,
  value,
  onValueChange,
  minimumExclusive,
}: AppointmentTimeSelectProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className="mt-1.5"
          aria-label={label}
          indicator={
            <Clock
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          }
        >
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {APPOINTMENT_TIME_OPTIONS.map((time) => (
            <SelectItem
              key={time}
              value={time}
              disabled={
                minimumExclusive !== undefined &&
                !isAppointmentTimeAfter(time, minimumExclusive)
              }
            >
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
