# Research: Paciente, Agenda, Financeiro Inicial e WhatsApp

## Planning Brief

Build the first private operational slice for a single autonomous therapist:
create a patient, complete the patient's financial profile, create a non-overlap
appointment, and attempt an outbound WhatsApp confirmation. Keep the feature
server-first in `apps/web`, faithful to the Lovable prototype, scoped to one
professional account, and production-safe for financial/contact data.

## Decision: Use Server Actions + Services for Internal Mutations

**Rationale**: The flows are internal form submissions from authenticated private
pages. Existing project architecture says services may call Prisma directly when
invoked server-side, and route handlers are reserved for HTTP boundaries such as
webhooks or external APIs.

**Alternatives considered**:
- Route handlers for every mutation: rejected because it adds internal HTTP hops,
  duplicates validation/error mapping, and is not needed for this app-only flow.
- Client-side fetching/SWR: rejected because the first version can be handled by
  Server Components, forms, server actions, and `revalidatePath`.

## Decision: Add Prisma Domain Models in the Main App Schema

**Rationale**: Patient, financial profile, appointment, and notification attempt
records are core relational data. They need user isolation, uniqueness constraints,
querying by dates/status, and transactional creation logic. Prisma/PostgreSQL is
the accepted persistence stack.

**Alternatives considered**:
- JSON blob on `User`: rejected because search, uniqueness, appointment overlap
  checks, and future finance expansion need relational constraints.
- Separate service/database: rejected as premature for a single-professional MVP.

## Decision: Store Patient Financial Readiness Separately from Patient Identity

**Rationale**: Patient identity/contact data and financial profile have different
validation rules, sensitivity, and screen ownership. A separate profile supports
the "Salvar e ir para o financeiro" flow and cleanly blocks appointment creation
when payment data is incomplete.

**Alternatives considered**:
- Put all financial fields on `Patient`: rejected because it couples identity
  creation to finance and makes future billing plans/charges harder to evolve.
- Defer finance entirely: rejected by the current spec; payment data is a
  precondition for appointments.

## Decision: Payment Method Support Is Conditional by Method

**Rationale**: The prototype and docs include PIX, card, cash, and insurance.
The app should require only what the selected method needs. This keeps the form
usable while preventing an appointment from being created with incomplete payment
setup.

**Chosen fields by method**:
- PIX: key/type or enough provider-safe information to request payment.
- Card: provider token/reference, brand/last4/holder metadata, not raw PAN/CVV.
- Cash: no external payment credential; value and method selection are enough.
- Insurance: payer/insurance name plus optional member/authorization data where
  available.

**Alternatives considered**:
- Require full fields for every method: rejected because it creates needless
  friction and contradicts conditional validation.
- Allow any method without details: rejected because the spec requires financial
  data to be complete enough before scheduling.

## Decision: Card Data Must Be Tokenized or Provider-Referenced

**Rationale**: A production clinical app should not store raw card number or CVV.
The ADR already names Stripe for online charging. Even if the immediate UI follows
the prototype, persistence must store only provider-safe references and non-sensitive
display metadata.

**Alternatives considered**:
- Store raw card details in PostgreSQL: rejected for PCI/security risk.
- Disable card method entirely: rejected because the user asked to keep the four
  prototype methods.
- Manual note only: rejected because it is too weak for future online charging.

## Decision: Appointment Creation Runs in a Transactional Domain Service

**Rationale**: Creating an appointment depends on user-scoped patient existence,
active patient status, financial readiness, no schedule overlap, WhatsApp
configuration, and notification attempt creation. These checks need a single
service boundary and a transaction where persistence must remain consistent.

**Alternatives considered**:
- Put checks in UI only: rejected because users can bypass UI and concurrency can
  create overlaps.
- Split appointment and notification into unrelated actions: rejected because the
  slice requires the confirmation attempt to be part of the appointment workflow.

## Decision: Outbound WhatsApp Uses an Injectable Adapter

**Rationale**: Production can use Twilio configuration, while tests and local
development can inject a fake sender. The spec says missing WhatsApp configuration
blocks appointment creation; a fake sender in tests is not the same as pretending
production config exists.

**Alternatives considered**:
- Direct Twilio calls in server action: rejected because it is hard to test and
  mixes UI action concerns with provider details.
- Inbound webhook now: rejected because the spec explicitly defers reply handling.

## Decision: Notification Statuses Stay Minimal

**Rationale**: The spec limits statuses to `pendente`, `enviado`, and `falhou`.
The service may create a pending attempt before provider response, then mark sent
or failed.

**Alternatives considered**:
- Add `bloqueado` or `nao_aplicavel`: rejected because clarify chose a smaller
  status set; blocked cases surface as validation errors or failed attempts with
  a reason where a notification attempt exists.

## Decision: Query Params Drive Focused Patient Finance Navigation

**Rationale**: The "Salvar e ir para o financeiro" flow should land on the new
patient's finance area with payment setup focused. Query params are already planned
as navigation contracts for later dashboard/finance flows and keep the interaction
shareable/testable.

**Alternatives considered**:
- Client-only local state after redirect: rejected because refresh/share/deep-link
  behavior would be brittle.
- Modal embedded in patient create form: rejected because the user explicitly
  wants the finance area to own payment setup.
