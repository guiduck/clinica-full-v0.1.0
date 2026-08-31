const PATIENT_TABS = ["geral", "anamnese", "agenda", "prontuario", "financeiro", "documentos"] as const;
const FINANCE_TABS = ["todos", "receitas", "despesas", "recibos", "categorias"] as const;
const CALENDAR_VIEWS = ["dia", "semana", "mes"] as const;
const PERIODS = ["semana", "mes", "3-meses", "6-meses", "ano"] as const;
const PATIENT_STATUSES = ["todos", "ativo", "inativo", "arquivado"] as const;

type SearchInput = URLSearchParams | Readonly<Record<string, string | string[] | undefined>>;

function getValue(input: SearchInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }
  const value = input[key];
  return Array.isArray(value) ? value[0] : value;
}

function enumValue<const T extends readonly string[]>(value: string | undefined, allowed: T, fallback: T[number]): T[number] {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback;
}

export function parsePatientRouteState(input: SearchInput) {
  return Object.freeze({
    tab: enumValue(getValue(input, "tab"), PATIENT_TABS, "geral"),
    search: (getValue(input, "q") ?? "").trim().slice(0, 100),
    status: enumValue(getValue(input, "status"), PATIENT_STATUSES, "todos")
  });
}

export function parseFinanceRouteState(input: SearchInput) {
  return Object.freeze({
    tab: enumValue(getValue(input, "tab"), FINANCE_TABS, "todos"),
    period: enumValue(getValue(input, "periodo"), PERIODS, "mes"),
    search: (getValue(input, "q") ?? "").trim().slice(0, 100),
    status: (getValue(input, "status") ?? "todos").trim() || "todos",
    category: (getValue(input, "categoria") ?? "todas").trim() || "todas"
  });
}

export function parseAgendaRouteState(input: SearchInput) {
  const date = getValue(input, "data");
  return Object.freeze({
    view: enumValue(getValue(input, "visualizacao"), CALENDAR_VIEWS, "semana"),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date : undefined,
    open: (getValue(input, "abrir") ?? "").trim().slice(0, 100) || undefined
  });
}

export function toCanonicalSearchParams(values: Readonly<Record<string, string | undefined>>): string {
  const params = new URLSearchParams();
  Object.entries(values)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => params.set(key, value));
  return params.toString();
}
