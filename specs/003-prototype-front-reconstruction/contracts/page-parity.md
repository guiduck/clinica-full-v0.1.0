# Contract: Page Parity and Incremental Acceptance

## Purpose

Define the evidence and acceptance contract for replacing one production page/route
at a time without weakening an existing page.

## Canonical Page Order

1. Shared design tokens and public shell foundation
2. `/login`
3. `/criar-conta`
4. `/recuperar-senha`
5. Authenticated app shell and onboarding
6. `/dashboard`
7. `/pacientes`
8. `/pacientes/novo`
9. `/pacientes/[patientId]` — Geral
10. `/pacientes/[patientId]` — Financeiro and Agenda tabs
11. `/agenda`
12. `/pacientes/[patientId]` — Anamnese and Prontuário tabs
13. `/pacientes/[patientId]` — Documentos tab
14. `/financeiro`
15. `/financeiro/previsibilidade`
16. `/configuracoes`

Tabs may be reviewed incrementally, but the patient-profile route is not complete
until all six tabs pass their rows.

## Required Matrix Fields

| Field | Requirement |
|---|---|
| Page | Canonical route/page key |
| Flow/state | Stable interaction or visual-state key |
| Viewport | `desktop` or `mobile` |
| Prototype reference | Screenshot and/or source node in frozen baseline |
| Production evidence | Browser screenshot plus automated/manual check reference |
| Capability mode | `real`, `transient`, or `unavailable` |
| Result | `pending`, `equivalent`, `approved-divergence`, or `unavailable-capability` |
| Justification | Mandatory unless result is `equivalent` |
| Product approval | Mandatory for `approved-divergence` before page acceptance |

## Fixed Evidence Viewports

- Desktop: `1440x900`
- Mobile: `390x844`

Additional responsive checks at intermediate widths are required when a table,
calendar, sheet, navigation element or form changes layout.

## Page Gate

A page can replace its current production implementation only when:

- every inventory row for the page exists for both fixed viewports;
- no row remains `pending`;
- real actions use real data and authenticated production boundaries;
- transient actions warn before discard and never persist;
- unavailable actions open the accessible contextual notice and do nothing else;
- keyboard/focus, touch targets, labels and responsive behavior pass;
- targeted unit/component/integration/browser checks pass;
- any visual/behavioral divergence has explicit product approval.

The full feature is complete only when every page and tab passes this contract.

## Failure Rules

- Baseline commit mismatch blocks comparison.
- Missing screenshot/state reference is `pending`, not implicit approval.
- Stock shadcn styling that differs from the baseline is a divergence.
- Security/LGPD/accessibility corrections are still documented and approved; their
  necessity does not bypass the matrix.
- A page with fewer working real flows than its current production version cannot
  be accepted.
