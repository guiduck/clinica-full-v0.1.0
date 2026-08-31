import { digitsOnly } from "@/utils/normalizers";

function joinGroups(digits: string, sizes: readonly number[], separators: readonly string[]): string {
  let cursor = 0;
  let output = "";

  for (let index = 0; index < sizes.length && cursor < digits.length; index += 1) {
    const group = digits.slice(cursor, cursor + sizes[index]);
    output += group;
    cursor += group.length;
    if (group.length === sizes[index] && cursor < digits.length) {
      output += separators[index] ?? "";
    }
  }

  return output;
}

export function maskCpf(value: string): string {
  return joinGroups(digitsOnly(value).slice(0, 11), [3, 3, 3, 2], [".", ".", "-"]);
}

export function maskCnpj(value: string): string {
  return joinGroups(digitsOnly(value).slice(0, 14), [2, 3, 3, 4, 2], [".", ".", "/", "-"]);
}

export function maskPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }
  const local = digits.slice(2);
  const split = digits.length === 11 ? 5 : 4;
  const first = local.slice(0, split);
  const second = local.slice(split);
  return `(${digits.slice(0, 2)}) ${first}${second ? `-${second}` : ""}`;
}

export function maskCep(value: string): string {
  const digits = digitsOnly(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function maskBrazilianDate(value: string): string {
  return joinGroups(digitsOnly(value).slice(0, 8), [2, 2, 4], ["/", "/"]);
}

export function maskBrl(value: string): string {
  const digits = digitsOnly(value).slice(0, 15);
  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(amount);
}

export type MaskEditResult = Readonly<{ value: string; cursor: number }>;

export function applyMaskedEdit(
  rawValue: string,
  rawCursor: number,
  mask: (value: string) => string
): MaskEditResult {
  const digitsBeforeCursor = digitsOnly(rawValue.slice(0, rawCursor)).length;
  const value = mask(rawValue);
  let seenDigits = 0;
  let cursor = value.length;

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      seenDigits += 1;
    }
    if (seenDigits === digitsBeforeCursor) {
      cursor = index + 1;
      break;
    }
  }

  return Object.freeze({ value, cursor: digitsBeforeCursor === 0 ? 0 : cursor });
}
