# Phase 0 Research: Reconstrução Integral do Frontend

## Scope of Research

This document resolves the technical decisions needed to plan the page-by-page
reconstruction of the production frontend. The frozen product/UX baseline is
`references/clinica-full` at commit
`226e5ab6811c5dce717fa12b404370b4fbb2663e`; it is not an architecture source.

## Decision 1: Page-by-page migration with a parity gate

**Decision**: Reconstruct one route/page at a time. A page is accepted only after
all applicable desktop and mobile rows in the parity contract are classified as
`equivalent`, `approved-divergence`, or `unavailable-capability`. Existing
production pages remain in place until their replacement passes that gate.

**Rationale**: This matches the clarified delivery model, keeps the application
deployable after every page, and prevents a broad frontend rewrite from replacing
working patient/agenda flows with placeholders.

**Alternatives considered**:

- Big-bang replacement: rejected because it delays validation and magnifies regressions.
- P1-only reconstruction: rejected because the accepted feature still requires 100% inventory coverage.
- Route-level feature flags: not required initially; file-level replacement and route tests provide a smaller mechanism.

## Decision 2: Explicit capability modes

**Decision**: Every interactive control is assigned exactly one mode:

- `real`: reads/mutates production data through an authenticated boundary;
- `transient`: implements complete local interaction, validation, masks and feedback,
  but does not persist and warns before discard;
- `unavailable`: stays visible and actionable only to open an accessible contextual
  notice; it performs no mutation, send, upload or success response.

The mapping is maintained in domain-local constants and the parity matrix. No
prototype mock store, fake toast, seeded production data or `localStorage` domain
model is allowed.

**Rationale**: This preserves product discovery and visual fidelity while making
the truthfulness boundary testable.

**Alternatives considered**:

- Disabled controls: rejected because they hide the reason and are harder to explain accessibly.
- Hidden controls: rejected because they break the frozen parity baseline.
- Client mock persistence: rejected by the constitution and because it creates false success.

## Decision 3: Server-first page composition

**Decision**: Route pages and layouts remain Server Components. They authenticate,
parse async `params`/`searchParams`, start independent reads in parallel, and pass
minimal serializable view models into focused Client Components. Client Components
own dialogs, sheets, calendars, chart interaction, forms, masks, onboarding and
other browser interaction. UI mutations use authenticated Server Actions; Route
Handlers remain reserved for auth HTTP endpoints, webhooks and external clients.

**Rationale**: The installed application is Next.js 15.2. Official Next.js guidance
keeps pages/layouts server-rendered by default, uses Client Components for state and
browser APIs, and recommends direct server reads instead of internal HTTP round
trips. See [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components),
[Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data), and
[Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend).

**Alternatives considered**:

- Whole-page Client Components: rejected due to bundle size, serialized data exposure and client waterfalls.
- Internal Route Handlers for every read/mutation: rejected because they duplicate an HTTP boundary inside the same app.
- Global mutable request state: rejected because concurrent server renders could leak data between users.

## Decision 4: Data changes are narrow and migration-safe

**Decision**: Add only persistence needed by already-real flows:

- a one-to-one `UserUiPreference` for onboarding, dashboard order, privacy and banner state;
- optional patient address, emergency contact, email consent and chief-complaint
  columns, while the new-create validator requires CPF, birth date, email and phone;
- non-sensitive appointment presentation fields (`type`, optional video URL) and the
  prototype status enum, without adding edit/reschedule/block mutations in this slice;
- optional non-sensitive card installment count in the existing financial profile.

Existing nullable patient columns remain nullable at database level so historical
rows migrate without fabricated backfill. The create wizard enforces the stronger
requirements. Plan templates, clinical records, financial entries, receipts,
documents, signatures, schedule blocks and message queues remain transient or
unavailable until their own production services are specified.

**Rationale**: It improves the real patient/onboarding/appointment paths without
silently implementing the large future domains explicitly excluded from this
feature. Schema changes use reviewed Prisma 5 migration SQL; migration history
remains committed and immutable, consistent with
[Prisma migration history guidance](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories).

**Alternatives considered**:

- Add every prototype entity now: rejected as an unreviewed backend expansion.
- Keep all new patient fields transient: rejected because the current patient service exists and silently dropping entered identity/contact data is unacceptable.
- Make legacy nullable columns immediately non-null: rejected because it requires invented backfill or breaks existing records.

## Decision 5: Forms, masks and canonical values

**Decision**: Use one Zod schema per flow as the shared validation source. Export
the schema, `zodResolver`, input/output types and pure normalizers. Masks display
CPF, CNPJ, phone, CEP, BRL and `dd/mm/aaaa`; schemas convert to canonical digits,
integer cents, ISO/date values and 24-hour time before a real Server Action. Fields
use `aria-invalid`, associated labels/descriptions and inline errors following the
[shadcn React Hook Form pattern](https://ui.shadcn.com/docs/forms/react-hook-form).

**Rationale**: This meets the Brazilian validation requirements and prevents the
client/server drift currently visible in optional patient fields and native date
inputs.

**Alternatives considered**:

- Separate client and server schemas: rejected because they drift.
- Browser-native date presentation: rejected because locale rendering can expose `mm/dd/yyyy`.
- Formatting inside page components: rejected because it is hard to test and reuse.

## Decision 6: URL state is server-parseable and shareable

**Decision**: Tabs, period, search, filters and contextual openings use canonical
query parameters parsed on the server. Invalid values fall back to a documented
default. Client controls update the URL; they do not own a second authoritative
copy. Client hooks that read `useSearchParams` are isolated under Suspense when
needed.

**Rationale**: Dashboard-to-finance and patient-to-agenda links remain recoverable
on refresh and shareable, while server reads use the same filter contract.

**Alternatives considered**:

- Page-local filter state only: rejected because context is lost on refresh/navigation.
- Global Zustand store for route filters: rejected because URL state is the canonical source.

## Decision 7: shadcn/ui is adapted to the baseline

**Decision**: Add shadcn/Radix primitives only as each page needs them; style them
through centralized CSS variables/tokens and domain variants so they reproduce the
prototype. Do not copy the reference `components/ui` directory wholesale. Accessible
focus, keyboard behavior, 44px touch targets, text/tooltips for icon actions and
mobile table-to-card transformations are acceptance requirements.

**Rationale**: shadcn/ui provides accessible primitives but its defaults are not a
visual specification. The clarified product decision requires the frozen Lovable
appearance and behavior.

**Alternatives considered**:

- Copy all prototype UI primitives: rejected because versions, styles and architecture differ.
- Accept stock shadcn visuals: rejected because it would be an unapproved redesign.
- Custom-build every primitive: rejected because it duplicates accessible behavior.

## Decision 8: Heavy interactive modules load on demand

**Decision**: Charts, drag-and-drop, calendar interaction, document preview,
signature canvas and future PDF composition are client boundaries loaded only on
pages/dialogs that need them. Independent server reads start in parallel; dense
sections use stable skeletons/Suspense where streaming does not alter critical
layout. Only fields consumed by the client cross the RSC boundary.

**Rationale**: These are the primary bundle and rendering risks. Dynamic imports,
parallel reads, strategic Suspense and minimal serialization keep the shared shell
fast without sacrificing page fidelity.

**Alternatives considered**:

- Import every prototype dependency into the shell: rejected due to global bundle cost.
- Client-fetch all dashboard/agenda data: rejected due to waterfalls and duplicated loading state.
- Premature virtualization everywhere: rejected; bounded lists and `content-visibility`
  are sufficient until measured scale justifies virtualization.

## Decision 9: Two-layer verification per page

**Decision**: Each page requires:

1. deterministic unit/component/integration tests for formatters, masks, schemas,
   route-state parsers, capability behavior and real actions;
2. Playwright navigation, interaction, accessibility smoke and screenshot evidence
   at fixed desktop (`1440x900`) and mobile (`390x844`) viewports.

Vitest keeps Node tests for services and uses jsdom for TSX component tests. Date
tests use fake clocks or relative factories. The page gate also runs lint,
typecheck, the full test suite and build before final feature completion.

**Rationale**: DOM tests verify rules; browser evidence verifies visual hierarchy,
responsive overlays and parity. Neither layer alone is sufficient.

**Alternatives considered**:

- Screenshot-only verification: rejected because behavior and validation regressions can be invisible.
- Manual-only review: rejected because the feature spans many repeatable flows.
- Pixel-perfect threshold as sole gate: rejected because font/platform rendering noise needs product review.

## Decision 10: Dependency additions are incremental

**Decision**: Keep installed versions pinned by `apps/web/package-lock.json`. Add
Radix/shadcn primitives and page-specific packages only when their page is
implemented. Expected candidates are `sonner`, `date-fns`, `recharts`,
`@hello-pangea/dnd`, `react-konva`, `react-pdf` and `@playwright/test`; each must be
bundle-checked and omitted if the page can meet the contract with existing code.

**Rationale**: The reference dependency list is not a production manifest. Page-wise
installation keeps bundle and vulnerability changes reviewable, especially with the
existing npm audit backlog.

**Alternatives considered**:

- Install the entire reference manifest: rejected because it imports TanStack/Vite/prototype infrastructure and unnecessary packages.
- Refuse all new dependencies: rejected because charts, accessible primitives and browser verification would be recreated poorly.

## Resolved Unknowns

All technical unknowns for this feature are resolved. Reliability thresholds beyond the accepted
user-visible response goal, production storage for documents, clinical encryption,
full financial persistence, inbound webhooks and provider-backed auth are explicitly
deferred to later feature plans rather than left ambiguous here.
