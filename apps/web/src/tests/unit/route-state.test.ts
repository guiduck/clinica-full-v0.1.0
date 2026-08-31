import { describe, expect, it } from "vitest";
import { parseAgendaRouteState, parseFinanceRouteState, parsePatientRouteState, toCanonicalSearchParams } from "@/utils/route-state";

describe("route state", () => {
  it("falls back safely for invalid patient and agenda values", () => {
    expect(parsePatientRouteState({ tab: "segredo", status: "apagado", q: "  Ana  " })).toEqual({
      tab: "geral",
      search: "Ana",
      status: "todos"
    });
    expect(parseAgendaRouteState({ visualizacao: "ano", data: "27/08/2026", abrir: "" })).toEqual({
      view: "semana",
      date: undefined,
      open: undefined
    });
  });

  it("uses one canonical finance recut", () => {
    expect(parseFinanceRouteState(new URLSearchParams("tab=receitas&periodo=3-meses&q=Maria&status=pago&categoria=Sessao"))).toEqual({
      tab: "receitas",
      period: "3-meses",
      search: "Maria",
      status: "pago",
      category: "Sessao"
    });
  });

  it("serializes query values in stable order and omits empty values", () => {
    expect(toCanonicalSearchParams({ status: "ativo", q: "Ana", tab: undefined })).toBe("q=Ana&status=ativo");
  });
});
