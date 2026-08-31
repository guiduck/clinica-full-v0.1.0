# Tasks: Paciente, Agenda, Financeiro Inicial e WhatsApp

**Input**: Design documents from `/specs/002-paciente-agenda-whatsapp/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Required by FR-015 and FR-016. This feature touches patient identity data, financial data, scheduling, auth-scoped domain rules, and external notification behavior, so unit and integration coverage is mandatory.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup

**Purpose**: Prepare feature folders, UI primitives, and environment contracts without changing behavior.

- [X] T001 Create feature folders in `apps/web/src/components/patients`, `apps/web/src/components/appointments`, `apps/web/src/services/patients`, `apps/web/src/services/patient-financial-profiles`, `apps/web/src/services/appointments`, and `apps/web/src/services/notifications`
- [X] T002 [P] Create placeholder type modules in `apps/web/src/types/patients.ts`, `apps/web/src/types/appointments.ts`, and `apps/web/src/types/notifications.ts`
- [X] T003 [P] Create validator files in `apps/web/src/utils/validators/patient.ts`, `apps/web/src/utils/validators/patient-financial-profile.ts`, and `apps/web/src/utils/validators/appointment.ts`
- [X] T004 [P] Create server action files in `apps/web/src/actions/patients.ts`, `apps/web/src/actions/patient-financial-profile.ts`, and `apps/web/src/actions/appointments.ts`
- [X] T005 Update `apps/web/.env.example` with Twilio WhatsApp variables and a safe comment that card raw number/CVV must not be stored
- [X] T006 [P] Add shared form/status UI primitives needed by this feature in `apps/web/src/components/ui`

---

## Phase 2: Foundational

**Purpose**: Shared data model, authorization, validation helpers, and service primitives required by all user stories.

**Critical**: No user story implementation should start until this phase is complete.

- [X] T007 Update Prisma schema with `Patient`, `PatientFinancialProfile`, `Appointment`, and `NotificationAttempt` models in `apps/web/prisma/schema.prisma`
- [X] T008 Add per-user uniqueness constraints and indexes for `Patient.normalizedPhone`, `Patient.normalizedCpf`, appointment date ranges, and notification lookups in `apps/web/prisma/schema.prisma`
- [X] T009 Create and validate a Prisma migration for the feature from `apps/web/prisma/schema.prisma`
- [X] T010 Run Prisma client generation and ensure generated client compiles from `apps/web/prisma/schema.prisma`
- [X] T011 [P] Implement phone and CPF normalization helpers in `apps/web/src/services/patients/normalization.ts`
- [X] T012 [P] Implement typed domain error helpers for patient, finance, appointment, and notification failures in `apps/web/src/lib/errors/domain-errors.ts`
- [X] T013 [P] Implement environment/config validation for WhatsApp provider readiness in `apps/web/src/services/notifications/whatsapp-config.ts`
- [X] T014 [P] Define payment, patient, appointment, and notification enums/types in `apps/web/src/types/patients.ts`, `apps/web/src/types/appointments.ts`, and `apps/web/src/types/notifications.ts`
- [X] T015 Implement shared authenticated service guard using existing session helpers in `apps/web/src/lib/auth/require-user.ts`
- [X] T016 [P] Add safe audit/logging helper that avoids patient clinical content, raw payment data, tokens, and provider secrets in `apps/web/src/services/audit/safe-audit-log.ts`
- [X] T017 [P] Add test factories for users, patients, financial profiles, appointments, and notification attempts in `apps/web/src/tests/factories/clinical-domain.ts`
- [X] T018 [P] Add test helpers for fake WhatsApp sender and fixed clock in `apps/web/src/tests/fakes/whatsapp-sender.ts`

**Checkpoint**: Foundation ready for user story implementation.

---

## Phase 3: User Story 1 - Cadastrar Paciente (Priority: P1)

**Goal**: Therapist can create a patient with required contact/consent data, duplicate prevention, and "Salvar e ir para o financeiro".

**Independent Test**: Create a valid patient, verify it appears in the patient list/search, verify duplicate phone/CPF is blocked, and verify save-and-go-to-finance redirects to the new patient's finance page.

### Tests for User Story 1

- [X] T019 [P] [US1] Add patient validator tests for required name/phone, optional email/CPF/birth date, phone normalization, and WhatsApp consent in `apps/web/src/tests/unit/patient-validation.test.ts`
- [X] T020 [P] [US1] Add patient service tests for create, search, duplicate normalized phone, duplicate normalized CPF, and user isolation in `apps/web/src/tests/unit/patient-service.test.ts`
- [X] T021 [P] [US1] Add patient server action integration tests for invalid input, duplicate input, normal save, and save-and-go-to-finance redirect in `apps/web/src/tests/integration/patient-actions.test.ts`

### Implementation for User Story 1

- [X] T022 [US1] Implement `patientSchema`, `patientResolver`, and `PatientInput` in `apps/web/src/utils/validators/patient.ts`
- [X] T023 [US1] Implement patient create/search service functions in `apps/web/src/services/patients/patients.ts`
- [X] T024 [US1] Implement `createPatientAction` with typed errors, auth guard, revalidation, and finance redirect support in `apps/web/src/actions/patients.ts`
- [X] T025 [P] [US1] Build patient create form with "Salvar" and "Salvar e ir para o financeiro" actions in `apps/web/src/components/patients/patient-form.tsx`
- [X] T026 [P] [US1] Build patient list/search UI matching Lovable private patient patterns in `apps/web/src/components/patients/patient-list.tsx`
- [X] T027 [US1] Add private patient list page in `apps/web/src/app/(private)/pacientes/page.tsx`
- [X] T028 [US1] Add private new patient page in `apps/web/src/app/(private)/pacientes/novo/page.tsx`
- [X] T029 [US1] Add patient detail shell with tabs and finance navigation target in `apps/web/src/app/(private)/pacientes/[patientId]/page.tsx`
- [X] T030 [US1] Verify patient UI labels, focus states, errors, mobile layout, and Lovable fidelity in `apps/web/src/components/patients/patient-form.tsx`

**Checkpoint**: US1 works independently.

---

## Phase 4: User Story 2 - Completar Financeiro Inicial do Paciente (Priority: P2)

**Goal**: Therapist can complete the patient's financial profile using PIX, cartao, dinheiro, or convenio with method-specific validation.

**Independent Test**: From a patient finance page, save each supported payment method with required data only, reject incomplete method data, reject raw card number/CVV, and mark the patient ready for appointment creation.

### Tests for User Story 2

- [X] T031 [P] [US2] Add financial profile validator tests for PIX, card, cash, insurance, default price, missing method data, and raw card/CVV rejection in `apps/web/src/tests/unit/patient-financial-profile-validation.test.ts`
- [X] T032 [P] [US2] Add financial profile service tests for create/update, patient ownership, readiness, and method-specific required fields in `apps/web/src/tests/unit/patient-financial-profile-service.test.ts`
- [X] T033 [P] [US2] Add financial profile action integration tests for finance page save, incomplete method data, and user isolation in `apps/web/src/tests/integration/patient-financial-profile-actions.test.ts`

### Implementation for User Story 2

- [X] T034 [US2] Implement `patientFinancialProfileSchema`, resolver, conditional method validation, and input types in `apps/web/src/utils/validators/patient-financial-profile.ts`
- [X] T035 [US2] Implement card safety guard that rejects raw card number/CVV and accepts provider-safe references in `apps/web/src/services/patient-financial-profiles/card-safety.ts`
- [X] T036 [US2] Implement upsert/read/readiness service functions in `apps/web/src/services/patient-financial-profiles/patient-financial-profiles.ts`
- [X] T037 [US2] Implement `upsertPatientFinancialProfileAction` with auth guard, typed errors, and revalidation in `apps/web/src/actions/patient-financial-profile.ts`
- [X] T038 [P] [US2] Build payment method segmented control and conditional fields in `apps/web/src/components/patients/patient-financial-profile-form.tsx`
- [X] T039 [P] [US2] Build finance readiness/status panel in `apps/web/src/components/patients/patient-financial-status.tsx`
- [X] T040 [US2] Add patient finance page with query-param focus support in `apps/web/src/app/(private)/pacientes/[patientId]/financeiro/page.tsx`
- [X] T041 [US2] Wire patient detail navigation to finance tab/page in `apps/web/src/app/(private)/pacientes/[patientId]/page.tsx`
- [X] T042 [US2] Verify financial UI labels, method-specific errors, no raw card persistence, mobile layout, and Lovable fidelity in `apps/web/src/components/patients/patient-financial-profile-form.tsx`

**Checkpoint**: US2 works independently and enables appointment readiness.

---

## Phase 5: User Story 3 - Agendar Consulta (Priority: P3)

**Goal**: Therapist can create a valid non-overlapping appointment only for an eligible patient with complete financial profile and WhatsApp configuration.

**Independent Test**: Create an appointment for a ready patient, verify it appears in agenda, verify past/invalid/overlapping appointments are rejected, and verify missing financial profile or WhatsApp config blocks creation.

### Tests for User Story 3

- [X] T043 [P] [US3] Add appointment validator tests for patient id, start/end range, past date, and date parsing in `apps/web/src/tests/unit/appointment-validation.test.ts`
- [X] T044 [P] [US3] Add appointment service tests for ownership, inactive patient exclusion, financial readiness, WhatsApp config precondition, and overlap prevention in `apps/web/src/tests/unit/appointment-service.test.ts`
- [X] T045 [P] [US3] Add appointment action integration tests for successful creation, blocked financial profile, missing WhatsApp config, and overlap errors in `apps/web/src/tests/integration/appointment-actions.test.ts`

### Implementation for User Story 3

- [X] T046 [US3] Implement `appointmentSchema`, resolver, and `AppointmentInput` in `apps/web/src/utils/validators/appointment.ts`
- [X] T047 [US3] Implement appointment overlap query and creation service shell in `apps/web/src/services/appointments/appointments.ts`
- [X] T048 [US3] Implement appointment creation transaction with patient ownership, financial readiness, WhatsApp config, and overlap checks in `apps/web/src/services/appointments/create-appointment-with-confirmation.ts`
- [X] T049 [US3] Implement `createAppointmentAction` with typed errors and path revalidation in `apps/web/src/actions/appointments.ts`
- [X] T050 [P] [US3] Build appointment form with patient selector and validation feedback in `apps/web/src/components/appointments/appointment-form.tsx`
- [X] T051 [P] [US3] Build agenda list/miniview with appointment status chips in `apps/web/src/components/appointments/agenda-list.tsx`
- [X] T052 [US3] Add private agenda page in `apps/web/src/app/(private)/agenda/page.tsx`
- [X] T053 [US3] Add patient appointment summary section in `apps/web/src/components/patients/patient-appointments-summary.tsx`
- [X] T054 [US3] Verify agenda UI labels, keyboard flow, responsive behavior, overlap error visibility, and Lovable fidelity in `apps/web/src/components/appointments/appointment-form.tsx`

**Checkpoint**: US3 works independently for ready patients.

---

## Phase 6: User Story 4 - Enviar Confirmacao por WhatsApp (Priority: P4)

**Goal**: Appointment creation attempts a transactional WhatsApp confirmation and records notification status as `pendente`, `enviado`, or `falhou`.

**Independent Test**: With a ready patient and configured WhatsApp sender, create an appointment and verify notification attempt creation, status transition, safe failure reason, and no inbound reply processing.

### Tests for User Story 4

- [X] T055 [P] [US4] Add notification service tests for pending-to-sent, pending-to-failed, safe failure reason, and no secret logging in `apps/web/src/tests/unit/notification-service.test.ts`
- [X] T056 [P] [US4] Add WhatsApp sender adapter tests for missing config, success result, and failure result in `apps/web/src/tests/unit/whatsapp-sender.test.ts`
- [X] T057 [P] [US4] Add appointment-plus-notification integration test for status persistence after provider success/failure in `apps/web/src/tests/integration/appointment-notification-pipeline.test.ts`

### Implementation for User Story 4

- [X] T058 [US4] Implement notification attempt repository/service functions in `apps/web/src/services/notifications/notification-attempts.ts`
- [X] T059 [US4] Implement WhatsApp sender adapter interface and Twilio-backed implementation in `apps/web/src/services/notifications/whatsapp-sender.ts`
- [X] T060 [US4] Implement appointment confirmation message builder with Portuguese transactional copy in `apps/web/src/services/notifications/appointment-confirmation-message.ts`
- [X] T061 [US4] Integrate notification attempt lifecycle into `apps/web/src/services/appointments/create-appointment-with-confirmation.ts`
- [X] T062 [P] [US4] Build notification status UI for agenda/patient context in `apps/web/src/components/appointments/notification-status-chip.tsx`
- [X] T063 [US4] Verify notification UI communicates `pendente`, `enviado`, and `falhou` without relying only on color in `apps/web/src/components/appointments/notification-status-chip.tsx`

**Checkpoint**: US4 completes the full operational slice.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Validate the full slice, harden sensitive paths, and update project docs.

- [ ] T064 [P] Run Prisma validation and migration checks from `apps/web/prisma/schema.prisma`
- [X] T065 Run full checks from `apps/web`: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`
- [ ] T066 Validate the quickstart demo path in `specs/002-paciente-agenda-whatsapp/quickstart.md`
- [X] T067 [P] Review safe logging/audit behavior across `apps/web/src/services/patients`, `apps/web/src/services/patient-financial-profiles`, `apps/web/src/services/appointments`, and `apps/web/src/services/notifications`
- [X] T068 [P] Review accessibility and Lovable fidelity for patient, finance, agenda, and notification screens in `apps/web/src/components/patients` and `apps/web/src/components/appointments`
- [X] T069 [P] Update `docs/roadmap.md` with implementation progress and validation results
- [X] T070 [P] Update `docs/project-overview.md` with final architecture/product decisions from the implemented slice
- [X] T071 [P] Update `docs/handoff.md` with files changed, validation results, blockers, and next step
- [X] T072 [P] Refresh or confirm `docs/next-spec-financeiro-dashboard-planos.md` as the next Spec Kit brief after implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: no dependencies.
- **Phase 2 Foundational**: depends on Phase 1 and blocks every user story.
- **Phase 3 US1**: depends on Phase 2.
- **Phase 4 US2**: depends on Phase 2 and integrates with US1 patient detail/navigation.
- **Phase 5 US3**: depends on Phase 2 and needs patient/financial profile data from US1/US2 for the full workflow.
- **Phase 6 US4**: depends on Phase 5 service flow because notifications are triggered by appointment creation.
- **Phase 7 Polish**: depends on the desired completed user stories.

### User Story Dependencies

- **US1 Cadastrar Paciente**: MVP starting point after foundation.
- **US2 Completar Financeiro Inicial**: can be built after foundation but needs patient records for end-to-end validation.
- **US3 Agendar Consulta**: requires US1 and US2 for realistic manual validation because scheduling requires patient and financial readiness.
- **US4 Enviar Confirmacao por WhatsApp**: requires US3 because the outbound notification is part of appointment creation.

### Parallel Opportunities

- Setup tasks T002, T003, T004, and T006 can run in parallel.
- Foundational tasks T011, T012, T013, T014, T016, T017, and T018 can run in parallel after schema direction is known.
- Tests within each user story can be written in parallel before implementation.
- UI component tasks marked `[P]` can run alongside service work when contracts are stable.
- Polish documentation tasks T069, T070, T071, and T072 can run in parallel after validation results are known.

## Parallel Example: User Story 1

```text
Task: T019 patient validator tests in apps/web/src/tests/unit/patient-validation.test.ts
Task: T020 patient service tests in apps/web/src/tests/unit/patient-service.test.ts
Task: T021 patient action integration tests in apps/web/src/tests/integration/patient-actions.test.ts
```

## Parallel Example: User Story 2

```text
Task: T031 financial validator tests in apps/web/src/tests/unit/patient-financial-profile-validation.test.ts
Task: T032 financial service tests in apps/web/src/tests/unit/patient-financial-profile-service.test.ts
Task: T038 financial form UI in apps/web/src/components/patients/patient-financial-profile-form.tsx
```

## Parallel Example: User Story 3

```text
Task: T043 appointment validator tests in apps/web/src/tests/unit/appointment-validation.test.ts
Task: T044 appointment service tests in apps/web/src/tests/unit/appointment-service.test.ts
Task: T050 appointment form UI in apps/web/src/components/appointments/appointment-form.tsx
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 to create searchable patient records and the finance redirect.
3. Stop and validate US1 independently before adding financial and scheduling rules.

### Incremental Delivery

1. US1 creates patient records.
2. US2 makes patient financial profiles complete and appointment-ready.
3. US3 creates appointments with precondition checks and agenda display.
4. US4 adds outbound WhatsApp notification attempts and status display.

### Quality Gate

Before considering the feature complete, pass Prisma validation/migration checks,
`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, the quickstart
demo path, safe logging review, accessibility review, and Lovable prototype fidelity
review.
