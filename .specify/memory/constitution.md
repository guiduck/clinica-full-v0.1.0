<!--
Sync Impact Report
Version change: 1.0.1 -> 1.1.0
Modified principles:
- I. Lovable-Guided Product Fidelity (baseline parity and honest placeholder behavior)
- III. Next.js Performance Architecture (frontend organization and functional helpers)
- IV. shadcn UI, Accessibility, and Visual Continuity (Brazilian form behavior)
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- no template changes required; new obligations are enforced through specs, plans,
  tasks, AGENTS.md, and project documentation
Follow-up TODOs:
- TODO(AUTH_BASELINE): reconcile Google-first ADR with Lovable e-mail/password + 2FA
  prototype direction before implementing auth.
- TODO(CLINICAL_CRYPTO): decide exact cryptography model for clinical notes before
  implementing prontuario persistence.
- TODO(CID_DSM_LICENSE): confirm licensed source and allowed UX for CID-11/DSM-5 lookup.
-->
# Clinica Agil Constitution

## Core Principles

### I. Lovable-Guided Product Fidelity
The Lovable prototype and `docs/lovable-prototype-prompt.md` are the functional and
visual baseline for development. Every feature specification MUST identify the
relevant prototype screens or state that no prototype screen exists. Implementations
MUST preserve the represented capabilities, navigation model, labels, and core flows
unless the spec documents a better equivalent experience and why it improves the
workflow. Development-only controls from the prototype, such as mock data generators,
MUST NOT ship to production.

When product or UX behavior is ambiguous, agents and implementers MUST follow the
Lovable prototype by default. A spec, ADR, or plan may override the prototype only
when the override is explicit and justified by security, LGPD, accessibility,
production architecture, or a deliberately narrowed vertical-slice scope.

For the integral frontend reconstruction, the prototype submodule commit
`226e5ab6811c5dce717fa12b404370b4fbb2663e` is the frozen parity baseline.
Interactions represented by the prototype but not yet backed by a production
service MUST remain visibly available only with an explicit not-implemented state;
implementations MUST NOT report fake success or persist mock data.

Rationale: the prototype is the shared product contract for clinicians, designers,
and engineers; drifting from it creates rework and invalidates user validation.

### II. Production-Ready Security and LGPD
Clinical data, identity data, financial records, documents, and signatures are
sensitive by default. Features MUST include authentication, authorization, input
validation, auditability, data retention/export implications, and LGPD consent
handling where relevant. Passwords MUST be hashed with a modern password hashing
strategy; sessions MUST use secure HttpOnly cookies in production; sensitive
webhooks MUST validate origin; logs MUST avoid clinical note contents and secrets.
Clinical notes MUST receive a documented encryption design before persistence work.

Rationale: this product handles mental-health records, so security and privacy are
product requirements, not implementation polish.

### III. Next.js Performance Architecture
The application MUST be built as a production-ready Next.js modular monolith unless
a future ADR changes this. Server Components MUST be preferred for data-heavy pages;
Client Components MUST be scoped to interaction boundaries; Server Actions or Route
Handlers MUST authenticate access before mutating data. Data fetching SHOULD avoid
waterfalls through parallel loading, Suspense, and request-level deduplication.
Heavy UI or PDF/signature modules SHOULD be dynamically loaded when not needed for
initial render. Images and fonts MUST use Next.js optimization patterns.

Page modules MUST remain focused on composition and orchestration. Complex or
reusable interaction state MUST move to domain hooks/components; fixed options and
metadata MUST move to domain-local `constants.ts`. Reusable formatters, Zod
validators, and masks MUST live in separate modules. Deterministic transformations
and calculations MUST be pure and immutable, with effects isolated in actions,
services, adapters, or integration hooks. Prototype stores, mock persistence,
page-local configuration sprawl, and scattered utilities MUST NOT be copied.

Rationale: the product has dense clinical and financial screens; performance must be
designed into the architecture instead of patched after implementation.

### IV. shadcn UI, Accessibility, and Visual Continuity
UI MUST use shadcn-style components, Tailwind-compatible design tokens, and the
Lovable visual direction: calm, clinical, organized, high-legibility, and modern.
Screens MUST keep the Lovable information architecture: app shell, sidebar,
dashboard, patient list, patient tabs, anamnese accordions, SOAP evolution, agenda,
finance, documents, and dialogs. Icon-only actions MUST include accessible labels or
tooltips; modals MUST be keyboard navigable; forms MUST have labels, validation
messages, visible focus, and safe handling for unsaved changes.

Brazilian input behavior is part of visual and functional continuity. User-visible
dates MUST use `dd/mm/yyyy`, time MUST use 24-hour notation, and money MUST use
`pt-BR`/BRL. CPF MUST validate check digits; CNPJ, phone, CEP, and conditional
financial fields MUST use reusable Zod-backed validation and masks on both client
and server boundaries.

Rationale: matching the validated prototype while improving accessibility gives the
team a stable design target without shipping a brittle prototype clone.

### V. Spec-Driven Vertical Slices and Quality Gates
Work MUST move through Spec Kit artifacts before implementation: spec, plan, tasks,
and validation checklist. Features MUST be cut as independently demonstrable
vertical slices that preserve production constraints. Risk-based tests are mandatory
for authentication, authorization, clinical records, finance, documents, signatures,
webhooks, and data migrations. Every completed slice MUST pass lint/type checks,
security review for touched sensitive paths, accessibility review for touched UI,
and a performance check for data-heavy pages.

Rationale: vertical slices let the team validate product value while preventing
prototype code from becoming insecure production code.

## Product and Technical Constraints

- The product target is a web SaaS for autonomous therapists, psychologists, and
  psychiatrists managing their own patients.
- The Lovable prototype in `references/images` and `docs/lovable-prototype-prompt.md`
  is the primary UX reference; `docs/project-requirements.md` is the consolidated
  requirements reference.
- The app stack is Next.js, TypeScript, shadcn/ui, react-hook-form, zod, Prisma,
  PostgreSQL, Auth.js/NextAuth, Resend, Stripe, Twilio WhatsApp, react-pdf, and
  react-konva unless superseded by an ADR.
- UI implementation MUST retain Lovable's user-facing Portuguese labels unless a
  spec explicitly changes copy.
- The first production architecture MUST remain a modular monolith. New services,
  AI pipelines, and multi-role/multi-professional support require an ADR.
- WhatsApp MUST remain transactional for MVP flows: reminders, confirmations, and
  simple response states. Autonomous chat agents are out of scope.
- Receipts MUST be generated by the app from internal financial records; payment
  provider receipts do not satisfy the healthcare receipt requirement.
- DSM content MUST NOT be embedded as full copyrighted criteria without confirmed
  licensing. CID/DSM behavior MUST be explicitly specified before implementation.
- Secrets, credentials, `.env` files, and production data dumps MUST NOT be committed.

## Development Workflow

1. Start each feature by reading the relevant project docs, Lovable prompt, and
   reference images before drafting the spec.
2. Specs MUST include prototype alignment, user scenarios, functional requirements,
   key entities, security/privacy requirements, accessibility expectations, and
   measurable success criteria.
3. Plans MUST declare the Next.js boundaries, data model, persistence approach,
   external integrations, performance risks, and security/LGPD implications.
4. Tasks MUST include foundational work for auth/authorization, validation,
   persistence, logging/audit, accessibility, and performance where the feature
   touches those areas.
   Frontend tasks MUST also cover parity, domain constants/hooks/components,
   reusable formatters/validators/masks, and tests for Brazilian input behavior.
5. Implementations MUST avoid broad rewrites. Refactors are allowed when they reduce
   real complexity or align code with these principles.
6. Before a feature is considered complete, the team MUST validate the user journey
   against the Lovable reference, run available lint/type/test checks, and document
   any accepted gaps.

## Governance

This constitution overrides conflicting informal guidance. Project docs and ADRs
remain authoritative when they are compatible with this constitution; conflicts MUST
be resolved by amending either the relevant ADR/doc or this constitution before
implementation.

Amendments MUST include a Sync Impact Report, semantic version bump rationale, and
template propagation review. MAJOR changes remove or redefine principles, MINOR
changes add or materially expand governance, and PATCH changes clarify wording
without changing obligations.

Every spec, plan, task list, implementation review, and release decision MUST check
compliance with the five core principles. Any intentional violation MUST be listed
in the plan complexity section with the reason, rejected simpler alternatives, and
the expected follow-up.

**Version**: 1.1.0 | **Ratified**: 2026-04-25 | **Last Amended**: 2026-08-27
