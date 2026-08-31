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

const TIME_OPTIONS = Array.from({ length: 24 * 6 }, (_, index) => {
  const hours = Math.floor(index / 6);
  const minutes = (index % 6) * 10;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

type AppointmentTimeSelectProps = Readonly<{
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}>;

export function AppointmentTimeSelect({
  id,
  label,
  value,
  onValueChange,
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
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_OPTIONS.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
