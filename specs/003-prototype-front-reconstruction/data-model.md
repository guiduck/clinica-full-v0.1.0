# Data Model: Reconstrução Integral do Frontend

## Modeling Boundary

This feature does not turn every prototype object into a database model. Each
domain object is classified as `persisted-existing`, `persisted-extension`,
`transient-ui`, `unavailable-capability`, or `documentation-artifact`.

## Persistence Matrix

| Entity / concept | Disposition in this feature | Reason |
|---|---|---|
| User, Session | persisted-existing | E-mail/password auth and database sessions are already real |
| UserUiPreference | persisted-extension | Onboarding resume, value privacy, banner dismissal and dashboard order require honest persistence |
| Patient | persisted-extension | Existing service can safely retain the full non-clinical create-wizard data |
| PatientFinancialProfile | persisted-extension | Existing service remains real; only non-sensitive installment metadata is added |
| Appointment | persisted-extension | Existing create/list flow retains type, video URL and complete display status vocabulary |
| NotificationAttempt | persisted-existing | Existing outbound WhatsApp status remains real |
| ParityMatrixEntry | documentation-artifact | Review evidence belongs in the feature artifacts, not production data |
| ClinicalRecordDraft | transient-ui | Full form behavior is required, but persistence awaits the clinical encryption decision |
| FinanceEntryDraft, BillingPlanDraft, ReceiptDraft | transient-ui / unavailable-capability | Global finance persistence and charging are not part of the existing service slice |
| DocumentDraft, SignatureDraft | transient-ui / unavailable-capability | Editor/canvas interaction is demonstrable; save/upload/PDF/signing persistence is blocked |
| ScheduleBlockDraft, AppointmentEditDraft | transient-ui / unavailable-capability | Calendar UI is complete; only current appointment creation persists |
| MessageTemplateDraft, MessageQueueDraft | transient-ui / unavailable-capability | Existing WhatsApp attempt is real; template/queue automation is not |

## Persisted Entities

### User

Existing fields remain unchanged. The relationship below is added:

- `uiPreference`: optional one-to-one `UserUiPreference`

No Google-provider fields, password-reset token fields or multi-role fields are
introduced by this feature.

### UserUiPreference *(new)*

| Field | Type | Rules |
|---|---|---|
| `id` | String | Primary identifier |
| `userId` | String | Unique FK to User; cascade on user deletion |
| `onboardingStep` | Int | Default 0; non-negative; clamped to known step count |
| `onboardingCompletedAt` | DateTime? | Set once final step is completed |
| `onboardingSkippedAt` | DateTime? | Set when user explicitly skips; cleared if tour restarts |
| `dashboardSectionOrder` | Json? | Ordered array of known section keys; unknown/duplicate keys discarded by validator |
| `hideFinancialValues` | Boolean | Default false |
| `dismissedNewsBannerAt` | DateTime? | Null means banner may be shown |
| `createdAt` | DateTime | Default now |
| `updatedAt` | DateTime | Automatically updated |

**State transitions**:

- `not_started -> in_progress -> completed`
- `not_started|in_progress -> skipped`
- `skipped|completed -> in_progress` only through explicit restart

All updates are scoped to the authenticated `userId`; the client never submits a
different target user id.

### Patient *(existing, extended)*

Existing identity, ownership and uniqueness fields remain. Add nullable storage
fields so legacy rows migrate without fabricated values:

| Field | Type | Rules for new create flow |
|---|---|---|
| `chiefComplaint` | String? | Optional; max 500 characters |
| `emailConsent` | Boolean | Default false; independent from WhatsApp consent |
| `addressZipCode` | String? | Canonical 8 digits when present |
| `addressStreet` | String? | Trimmed; optional |
| `addressNumber` | String? | Trimmed; optional |
| `addressComplement` | String? | Trimmed; optional |
| `addressCity` | String? | Trimmed; optional |
| `addressState` | String? | Two uppercase letters when present |
| `emergencyContactName` | String? | Optional; required only if another emergency field is provided |
| `emergencyContactPhone` | String? | Canonical 10/11 digits when present |
| `emergencyContactRelationship` | String? | Optional; required only if another emergency field is provided |

Application rules for newly created patients:

- `name`, `cpf`, `birthDate`, `email`, and `phone` are required;
- CPF must pass both check digits and be unique per user through `normalizedCpf`;
- phone must contain 10 or 11 digits and remains unique per user through
  `normalizedPhone`;
- birth date must be from 1900 through the current local date;
- email is normalized with trim/lowercase and validated;
- address is entirely optional, but a provided CEP/UF must be valid;
- emergency fields form one conditional group;
- existing legacy records with missing formerly-optional fields remain readable and
  are shown as incomplete rather than backfilled.

### PatientFinancialProfile *(existing, extended)*

Add:

| Field | Type | Rules |
|---|---|---|
| `cardInstallments` | Int? | Null unless card; allowed values 1 or 2–12 in patient wizard |

Existing safety rules remain:

- raw PAN/CVV are never accepted or stored;
- card fields hold provider reference and non-sensitive metadata only;
- PIX needs key type/key; insurance needs payer name; cash needs no extra data;
- default session price is positive integer cents in BRL.

Only the `Avulso` billing path completes a real persistence flow in this feature.
Selecting `Plano`, welcome message, contract generation or other unsupported side
effects opens the capability notice and does not submit a fake result.

### Appointment *(existing, extended)*

Add:

| Field | Type | Rules |
|---|---|---|
| `type` | String | Default `Consulta`; bounded domain constant |
| `videoUrl` | String? | Valid HTTPS URL when present |

Expand `AppointmentStatus` to the prototype vocabulary:

- `agendada`
- `confirmada`
- `realizada`
- `falta`
- `cancelada`
- `remarcada`
- `pendente`
- `recusada`

This feature persists the status on create/default and displays any existing status,
but does not add edit, status transition, reschedule, recurrence or block mutations.
Those controls use transient drafts and end in an explicit capability notice.

**Current real creation rules**:

- authenticated ownership and patient ownership are mandatory;
- patient financial profile and WhatsApp configuration must be ready;
- `startsAt < endsAt`, start is not in the past, and no appointment overlap exists;
- timestamps are stored canonically and displayed in America/Sao_Paulo using
  `dd/mm/aaaa` and 24-hour time;
- outbound WhatsApp attempt records the real `pendente|enviado|falhou` result.

### NotificationAttempt *(existing)*

No schema expansion is planned. `failureReason` stays safe for operational detail
only and must not contain message bodies, secrets or clinical content.

## Non-Persisted View Models

### CapabilityDescriptor

```text
key: stable domain capability key
mode: real | transient | unavailable
title: Portuguese user-facing name
message: contextual unavailable/discard explanation
affectedAction: save | send | upload | sign | generate | mutate | navigate
```

Descriptors are immutable domain-local constants. They contain no patient/user data.

### ParityMatrixEntry

```text
page: canonical route/page key
flow: stable interaction key
viewport: desktop | mobile
prototypeReference: image/source/state reference
productionEvidence: screenshot/test/manual evidence reference
status: pending | equivalent | approved-divergence | unavailable-capability
capabilityMode: real | transient | unavailable
justification: required for non-equivalent rows
productApproval: approver and date required for approved divergence
```

### ClinicalRecordDraft

Contains the prototype fields for Anamnese, free/SOAP evolution, mood, optional
appointment link and session timer. It exists only in component/hook state for the
current interaction. It is never written to storage, logs, URL, cookies, cache or
analytics. Save/autosave is blocked. Navigation with content requires discard
confirmation.

### Other transient drafts

Finance, plans, receipts, documents, signature, scheduling blocks, appointment
editing and message templates follow the same rules:

- full validation/masks/conditional behavior where represented;
- current interaction state only;
- no success message that implies persistence;
- final mutation action opens the contextual capability notice;
- discard confirmation where user-entered content would otherwise be lost.

## Migration Plan

1. Add `UserUiPreference` and its unique user relationship.
2. Add nullable/defaulted Patient columns; do not modify legacy values.
3. Add nullable `cardInstallments`.
4. Add Appointment `type`, `videoUrl`, and enum values using migration-safe defaults.
5. Generate Prisma client and validate migration SQL before applying.
6. Update factories and service tests for both complete new records and incomplete
   legacy records.

No destructive migration, mass backfill or synthetic production data is permitted.
