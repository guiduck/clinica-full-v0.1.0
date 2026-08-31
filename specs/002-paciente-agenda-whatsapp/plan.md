# Implementation Plan: Paciente, Agenda, Financeiro Inicial e WhatsApp

**Branch**: `002-paciente-agenda-whatsapp` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-paciente-agenda-whatsapp/spec.md`

## Summary

Implement the first private operational slice after auth: the therapist can create
a patient, complete the patient's initial financial profile, create a non-overlap
appointment, and trigger an outbound WhatsApp confirmation attempt. The slice stays
server-first in `apps/web`: private pages and lists render on the server, mutations
use server actions, domain rules live in services, Zod validators live in
`src/utils/validators`, Prisma persists the new domain models, and an injectable
WhatsApp sender handles Twilio integration without adding inbound webhooks yet.

The plan follows the Lovable prototype as the default UX contract while narrowing
the scope to a production-ready vertical slice. Payment card handling must preserve
the prototype flow without storing raw card numbers or CVV in the app; only
provider-safe references or non-sensitive descriptors may be persisted.

## Technical Context

**Language/Version**: TypeScript 5.7 + Next.js 15.2 App Router + React 19  
**Primary Dependencies**: shadcn-style local UI components, lucide-react, react-hook-form, zod, Prisma 5.22, PostgreSQL, existing database-backed auth/session helpers, Twilio WhatsApp integration via service adapter  
**Storage**: PostgreSQL via Prisma in `apps/web/prisma/schema.prisma`; local Postgres through `apps/web/docker-compose.yml`; no file storage in this slice  
**Testing**: Vitest for unit/integration tests; `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`; Prisma validation/migration checks for schema changes  
**Target Platform**: Web app on Vercel-compatible runtime  
**Project Type**: Next.js modular monolith in `apps/web`  
**Performance Goals**: private patient and agenda pages should render quickly for MVP-scale lists, avoid client-side remote fetching, and revalidate affected patient/agenda/dashboard paths after mutations; patient search and upcoming appointment lists should be bounded/paginated rather than loading unbounded data  
**Constraints**: Lovable-guided Portuguese UI, production-ready server-first behavior, LGPD/security for patient and financial data, accessibility, mobile responsiveness, no patient portal, no inbound WhatsApp webhook, no billing-plan generation in this slice  
**Scale/Scope**: single professional account; patient, appointment, financial profile, and notification records are isolated by authenticated therapist/user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Lovable fidelity**: PASS. This plan references Lovable private app patterns for patient creation, patient tabs/finance, agenda, and WhatsApp notification feedback from `docs/lovable-prototype-prompt.md` and `references/images`. The plan preserves the app shell, Portuguese labels, patient/agenda/finance flow, status chips, and adds the requested "Salvar e ir para o financeiro" action.
- **Security/LGPD**: PASS. Patient identity/contact, consent, schedule, financial profile, and notification records are sensitive. All reads/mutations require the authenticated user and user-scoped queries. Logs must avoid clinical content, raw payment data, tokens, and message body secrets. Card data must not be stored as raw PAN/CVV; use provider-safe references or non-sensitive descriptors.
- **Next.js performance**: PASS. Private pages use Server Components for initial data; forms and tab/modal interactions use focused Client Components; mutations use server actions calling services. Services call Prisma directly for internal app flows. Heavy external integration is isolated behind service adapters.
- **shadcn/accessibility**: PASS. Use existing shadcn-style controls and add missing UI primitives only as needed. Forms need labels, inline errors, keyboard/focus behavior, and status text that does not rely only on color.
- **Vertical slice quality**: PASS. Independent demo path is login -> patients -> new patient -> save and go to finance -> complete payment profile -> create appointment -> see agenda -> record WhatsApp status. Tests cover validators, duplicate prevention, financial precondition, overlap prevention, and notification outcomes.

## Project Structure

### Documentation (this feature)

```text
specs/002-paciente-agenda-whatsapp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── server-actions.md
│   └── services.md
└── tasks.md
```

### Source Code (`apps/web`)

```text
apps/web/
├── prisma/
│   └── schema.prisma
└── src/
    ├── actions/
    │   ├── appointments.ts
    │   ├── patient-financial-profile.ts
    │   └── patients.ts
    ├── app/
    │   └── (private)/
    │       ├── agenda/
    │       │   └── page.tsx
    │       ├── dashboard/
    │       │   └── page.tsx
    │       └── pacientes/
    │           ├── novo/
    │           │   └── page.tsx
    │           ├── page.tsx
    │           └── [patientId]/
    │               ├── page.tsx
    │               └── financeiro/
    │                   └── page.tsx
    ├── components/
    │   ├── appointments/
    │   ├── patients/
    │   ├── private-shell/
    │   └── ui/
    ├── services/
    │   ├── appointments/
    │   ├── notifications/
    │   ├── patient-financial-profiles/
    │   └── patients/
    ├── tests/
    │   ├── integration/
    │   └── unit/
    ├── types/
    │   ├── appointments.ts
    │   ├── notifications.ts
    │   └── patients.ts
    └── utils/
        └── validators/
            ├── appointment.ts
            ├── patient-financial-profile.ts
            └── patient.ts
```

**Structure Decision**: Keep the production app as a Next.js modular monolith in
`apps/web`. Use route handlers only for true HTTP boundaries in later slices; this
slice's internal form flows use server actions and services. The notification
sender is a service adapter so tests can use a fake sender while production can use
Twilio when configured.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0 Research Summary

See [research.md](./research.md). Key decisions: Prisma models are added for
patients, financial profiles, appointments, and notification attempts; internal
mutations use server actions and services; WhatsApp outbound is adapter-based;
card data uses token/reference-safe storage rather than raw card data; inbound
WhatsApp replies, billing plans, receipts, and advanced finance filters are kept
for later specs.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/server-actions.md](./contracts/server-actions.md),
[contracts/services.md](./contracts/services.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Lovable fidelity**: PASS. Design artifacts preserve the patient -> finance -> agenda -> WhatsApp flow and encode prototype precedence.
- **Security/LGPD**: PASS. Data model scopes all records to `userId`, avoids raw card data, and captures consent/payment readiness explicitly.
- **Next.js performance**: PASS. Server Components own page data; server actions mutate and revalidate; no client remote cache library is introduced.
- **shadcn/accessibility**: PASS. UI contracts require labels, inline errors, keyboard navigation, status text, and Portuguese copy.
- **Vertical slice quality**: PASS. Quickstart defines a complete demo path plus unit/integration/build validation.
