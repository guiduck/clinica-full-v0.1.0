# Implementation Plan: Reconstrução Integral do Frontend

**Branch**: `003-prototype-front-reconstruction` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-prototype-front-reconstruction/spec.md`

## Summary

Reconstruct the Clinica Agil production frontend page by page with visual and
functional parity to the frozen Lovable commit
`226e5ab6811c5dce717fa12b404370b4fbb2663e`. Keep Next.js pages server-first,
isolate dense interaction in focused Client Components, adapt shadcn/ui to the
baseline rather than accepting stock visuals, and preserve existing auth,
patient, financial-profile, appointment and WhatsApp flows. Interactions without
production capability remain fully discoverable as either validated transient
flows or accessible unavailable notices, never fake persistence.

The delivery unit is one page/route (or one independently reviewed patient-profile
tab). Each unit must pass its desktop/mobile parity matrix before replacing the
current production implementation; the feature completes only at 100% matrix
coverage.

## Technical Context

**Language/Version**: TypeScript 5.7.3, Next.js 15.2 App Router, React 19  
**Primary Dependencies**: existing Tailwind CSS 4, shadcn-style components, react-hook-form 7, Zod 3, Prisma 5.22, PostgreSQL, lucide-react; page-scoped additions expected for Radix/shadcn primitives, sonner, date-fns, recharts, @hello-pangea/dnd, react-konva and react-pdf only when their page needs them  
**Storage**: PostgreSQL via Prisma for existing real domains plus narrow `UserUiPreference`, Patient, PatientFinancialProfile and Appointment extensions; no clinical, financial-entry, document or message persistence in this feature  
**Testing**: Vitest 3 with Node service tests and jsdom React Testing Library component tests; Playwright for route interaction, accessibility smoke and fixed-viewport screenshot evidence; ESLint, TypeScript and Next production build gates  
**Target Platform**: Responsive web app on a Vercel-compatible Node.js runtime  
**Project Type**: Next.js modular monolith in `apps/web`  
**Performance Goals**: 95% of in-app navigation interactions show feedback within 1 second under normal validation conditions; shared shell does not import page-heavy chart/calendar/document modules; independent server reads run in parallel; patient lists remain bounded at 50 and agenda reads at 100 until pagination is planned  
**Constraints**: exact Lovable visual/behavioral fidelity, Portuguese UI, shadcn/ui as implementation mechanism, LGPD/security, keyboard/focus accessibility, 44px touch targets, desktop/mobile evidence, Brazilian masks and formats, no `mm/dd/yyyy`, no mock/localStorage domain persistence, no fake success  
**Scale/Scope**: one autonomous professional per account; current bounded MVP datasets; no patient portal, multi-professional roles, AI, inbound WhatsApp, advanced signature, full clinical persistence or full financial/document backend  

All technical unknowns are resolved. Version choices are taken from the current
`apps/web/package.json` and lockfile, not upgraded by this plan.

## Constitution Check

*GATE: PASS before Phase 0 research.*

- **Lovable fidelity**: PASS. Every page is mapped to `docs/prototype-feature-inventory.md`, `docs/lovable-prototype-prompt.md`, `references/images` and the frozen source. shadcn/ui differences are not accepted implicitly; divergences require matrix evidence and product approval.
- **Security/LGPD**: PASS. Reads/actions remain user-scoped and authenticated. Sensitive values are minimized across RSC boundaries and omitted from logs. Clinical drafts stay in current component state only, with save/autosave blocked until encryption is designed. Raw card/CVV remains prohibited.
- **Next.js performance**: PASS. Pages/layouts are Server Components; Client Components are interaction islands. Reads call services directly and start independent work in parallel. Heavy charts, DnD, calendar, PDF/signature code loads on demand. Route Handlers remain external HTTP boundaries.
- **shadcn/accessibility**: PASS. Required primitives are added page-wise and styled to the baseline. Labels, inline errors, `aria-invalid`, focus return, keyboard overlays, non-color status cues, icon labels/tooltips and responsive table/calendar behavior are mandatory.
- **Vertical slice quality**: PASS. Each page is independently demonstrable and cannot replace its current page until targeted unit/component/integration/Playwright checks and both parity viewports pass. Full lint, typecheck, test and build remain final gates.

## Planning Brief

### Primary actor and outcome

- Actor: authenticated autonomous therapist/psychologist.
- Outcome: operate the full validated prototype experience in the production app,
  with real current services and honest boundaries elsewhere.

### Accepted defaults

- E-mail/password auth stays real; Google/password recovery remain visible/unavailable.
- WhatsApp stays transactional and uses the existing outbound attempt only.
- DSM/CID remains manual input without catalog content.
- Receipts remain app-owned PDF concepts but generation/persistence is unavailable here.
- Signature is simple with evidence visually/interactively, without persisted signing in this feature.
- Patient portal, multi-role, IA and advanced integrations remain out of scope.

## Delivery Strategy

### Foundation pass

Before replacing pages:

1. freeze and verify the reference commit;
2. create the parity-matrix artifact from `contracts/page-parity.md`;
3. establish production design tokens, typography, responsive containers and missing
   shadcn primitives without copying the reference UI folder;
4. add reusable `formatters`, `masks`, validators, capability notice and unsaved-discard behavior;
5. configure TSX/jsdom component tests and Playwright fixed viewports;
6. apply and validate only the approved narrow Prisma migration.

### Page order

1. `/login`
2. `/criar-conta`
3. `/recuperar-senha`
4. authenticated app shell + onboarding
5. `/dashboard`
6. `/pacientes`
7. `/pacientes/novo`
8. `/pacientes/[patientId]` Geral
9. `/pacientes/[patientId]` Financeiro + Agenda
10. `/agenda`
11. `/pacientes/[patientId]` Anamnese + Prontuário
12. `/pacientes/[patientId]` Documentos
13. `/financeiro`
14. `/financeiro/previsibilidade`
15. `/configuracoes`

This order brings shared foundations and existing real flows forward, then layers
transient/unavailable domains. A later page may use the new shell before its own
content is reconstructed, but its working production content cannot regress.

### Per-page gate

- enumerate route, tab, dialog, sheet, empty/loading/error and contextual-link states;
- classify every interaction `real`, `transient`, or `unavailable`;
- implement desktop/mobile structure and browser interaction;
- verify Brazilian masks, validators and canonical conversions;
- run targeted tests and Playwright evidence at `1440x900` and `390x844`;
- document and obtain product approval for divergences;
- replace the production page only when no page row remains pending.

## Data and State Boundaries

### Real persisted flows

- auth/session e-mail/password;
- patient create/search/read, expanded with non-clinical wizard fields;
- supported Avulso financial profile and payment method data;
- appointment create/list with basic type/video presentation fields;
- outbound WhatsApp attempt status;
- onboarding/dashboard UI preferences.

### Transient interaction flows

- clinical Anamnese/Prontuário fields, validation, masks, conditions, SOAP, mood and timer;
- unsupported appointment edit/reschedule/status/recurrence/block drafts;
- finance entry/plan/receipt, document editor/signature and message template/queue drafts.

Transient values stay inside the mounted Client Component/hook. They never enter
localStorage, cookies, URL, cache, analytics or logs; final save is blocked and exit
with meaningful content requires discard confirmation.

### Unavailable final actions

Unsupported save/send/upload/generate/sign/mutate controls open the standard
accessible capability notice, restore focus on close and produce no success result.

## Rendering and Data Plan

- `page.tsx` files parse async params/search params, authenticate and compose sections.
- Server Components call domain services directly; internal pages do not fetch their own Route Handlers.
- Independent dashboard/patient/agenda reads start together with `Promise.all` or independent Suspense sections.
- Client view models contain only plain serializable fields; Dates cross as ISO strings.
- Query parsers are pure and canonicalize tab, period, status, search and contextual open state.
- `useSearchParams`/`usePathname` consumers are small and placed under appropriate Suspense boundaries.
- Server Actions re-authenticate, validate and authorize; middleware/layout protection is not considered sufficient.
- Heavy page-only modules use statically analyzable dynamic imports and stable skeleton dimensions.
- No mutable request/user state exists at module scope.

## Form and Localization Plan

- Domain validators export schema, resolver, input and parsed types.
- `src/utils/masks` handles progressive CPF/CNPJ/phone/CEP/BRL input without cursor-hostile rewriting.
- `src/utils/formatters` handles user-facing BRL, `dd/mm/aaaa`, 24-hour time and status labels.
- `src/utils/normalizers` produces digits, lowercase/trimmed e-mail, integer cents and canonical date/time values.
- Client and server use the same Zod schema; server never trusts masked client values.
- New patient creation requires name, valid/unique CPF, birth date from 1900 through today, valid e-mail and 10/11-digit phone.
- Native date inputs are not used where they can expose locale-dependent `mm/dd/yyyy`.
- Errors remain beside fields in Portuguese and form values survive validation failures.

## Test and Verification Plan

### Unit

- CPF/CNPJ check digits; phone/CEP; BRL; date/time parsing and boundaries;
- masks under append, delete, mid-string edit and paste;
- query-param parsers and capability descriptors;
- pure calendar positioning, finance calculations and dashboard buckets;
- controlled-clock appointment validation.

### Component

- forms with required/optional/conditional fields and inline errors;
- wizard step transitions and unsupported-option notice;
- dialogs/sheets focus trap/return and unavailable-capability notice;
- transient clinical draft validation, blocked save and discard confirmation;
- responsive table/card and calendar controls.

### Integration

- auth regression;
- atomic patient + supported financial-profile wizard creation;
- duplicate patient and ownership boundaries;
- UI preference persistence;
- appointment readiness, overlap and notification outcomes;
- migration compatibility with legacy nullable patient records.

### Browser and visual

- canonical navigation/query context for every page;
- desktop/mobile interaction and screenshot evidence;
- keyboard-only critical flows and accessible names;
- no clipping/overlap at fixed and intermediate widths;
- current real flows survive each page replacement;
- unavailable actions never create records or fake feedback.

## Project Structure

### Documentation (this feature)

```text
specs/003-prototype-front-reconstruction/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── interaction-capabilities.md
│   ├── page-parity.md
│   └── server-actions.md
└── tasks.md                     # created later by /speckit.tasks
```

### Source Code (`apps/web`)

```text
apps/web/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── actions/
│   │   ├── appointments.ts
│   │   ├── auth.ts
│   │   ├── patient-financial-profile.ts
│   │   ├── patients.ts
│   │   └── ui-preferences.ts
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── login/page.tsx
│   │   │   ├── criar-conta/page.tsx
│   │   │   └── recuperar-senha/page.tsx
│   │   └── (private)/
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── agenda/page.tsx
│   │       ├── financeiro/page.tsx
│   │       ├── financeiro/previsibilidade/page.tsx
│   │       ├── configuracoes/page.tsx
│   │       └── pacientes/
│   │           ├── page.tsx
│   │           ├── novo/page.tsx
│   │           └── [patientId]/page.tsx
│   ├── components/
│   │   ├── app-shell/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── clinical/
│   │   ├── finance/
│   │   ├── documents/
│   │   ├── messaging/
│   │   ├── settings/
│   │   ├── feedback/
│   │   └── ui/
│   ├── hooks/
│   │   ├── use-discard-confirmation.ts
│   │   └── domain-specific interactive hooks
│   ├── services/
│   │   ├── appointments/
│   │   ├── auth/
│   │   ├── notifications/
│   │   ├── patient-financial-profiles/
│   │   ├── patients/
│   │   └── ui-preferences/
│   ├── types/
│   ├── utils/
│   │   ├── formatters/
│   │   ├── masks/
│   │   ├── normalizers/
│   │   ├── route-state/
│   │   └── validators/
│   └── tests/
│       ├── unit/
│       ├── component/
│       ├── integration/
│       ├── factories/
│       └── fakes/
└── tests/
    └── e2e/
```

**Structure Decision**: Keep the existing Next.js modular monolith in `apps/web`.
Pages only compose routes/data. Domain components, hooks, constants and pure
transformations are separated by responsibility. Services call Prisma directly for
internal server flows; Route Handlers are not added for internal page data.

## Complexity Tracking

No constitution violations are required. The one-to-one UI preference model and
page-scoped Client Components are the smallest mechanisms that satisfy persisted
onboarding/preferences and the prototype's interaction density.

## Phase 0 Research Summary

See [research.md](./research.md). All technical unknowns are resolved: migration
strategy, capability modes, Server/Client boundaries, persistence boundary,
Brazilian forms, URL state, shadcn adaptation, heavy-module loading, page-wise
verification and dependency policy.

## Phase 1 Design Summary

- [data-model.md](./data-model.md) classifies every entity by persistence mode and
  defines narrow migration-safe extensions.
- [contracts/page-parity.md](./contracts/page-parity.md) defines the page order,
  evidence schema and acceptance gate.
- [contracts/interaction-capabilities.md](./contracts/interaction-capabilities.md)
  defines real, transient and unavailable behavior.
- [contracts/server-actions.md](./contracts/server-actions.md) limits authenticated
  production mutations.
- [quickstart.md](./quickstart.md) defines setup, per-page iteration and final validation.

## Post-Design Constitution Check

- **Lovable fidelity**: PASS. Contract requires evidence for every inventory state,
  fixed viewports and product approval for divergence.
- **Security/LGPD**: PASS. Data model distinguishes real persistence from ephemeral
  clinical/financial/document values; contracts prohibit sensitive data in storage,
  URL, logs or fake services.
- **Next.js performance**: PASS. Project structure and rendering plan constrain
  Client boundaries, serialization, parallel reads and dynamic page modules.
- **shadcn/accessibility**: PASS. Interaction and page contracts require adapted
  visuals, field semantics, keyboard/focus and mobile behavior.
- **Vertical slice quality**: PASS. Page order, independent gates and layered tests
  make each delivery demonstrable while retaining the 100% feature completion gate.

The plan is ready for `/speckit.tasks`.
