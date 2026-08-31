# Tasks: Reconstrução Integral do Frontend

**Input**: Design documents from `/specs/003-prototype-front-reconstruction/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Required by FR-039, FR-040 and SC-012. Authentication, patient identity, finance, agenda, clinical drafts, documents and migrations are sensitive paths; unit, component, integration and fixed-viewport browser coverage are mandatory as assigned below.

**Organization**: Tasks are grouped by user story. Inside each story, page/route subsections are complete vertical increments; finish each subsection's parity gate before replacing the next production page. All unsupported final actions must use the `transient` or `unavailable` contracts and must never simulate persistence or success.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes different files and has no dependency on an incomplete task.
- **[Story]**: Maps the task to a user story from [spec.md](./spec.md).
- Every task names the exact file or directory it changes.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish traceable parity evidence and the test harness without changing production behavior.

- [X] T001 Verify `references/clinica-full` is pinned to `226e5ab6811c5dce717fa12b404370b4fbb2663e` and record the check plus all canonical desktop/mobile rows from `docs/prototype-feature-inventory.md` in `specs/003-prototype-front-reconstruction/parity-matrix.md`
- [X] T002 [P] Create typed parity and capability test fixtures in `apps/web/src/tests/factories/prototype-parity.ts`
- [X] T003 Configure Vitest Node/jsdom projects and React Testing Library setup in `apps/web/vitest.config.ts` and `apps/web/src/tests/setup.ts`
- [X] T004 Configure Playwright desktop `1440x900` and mobile `390x844` projects, authenticated state and screenshot output in `apps/web/playwright.config.ts` and `apps/web/tests/e2e/auth.setup.ts`
- [X] T005 Add component/e2e scripts and only the test dependencies required by T003-T004 in `apps/web/package.json` and `apps/web/package-lock.json`
- [X] T006 [P] Create stable browser seed/factory helpers that use real test boundaries without production mocks in `apps/web/tests/e2e/fixtures/clinica-fixture.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the persistence boundary, Brazilian input utilities, URL-state contract, honest capability feedback and shared accessible primitives required by every page.

**Critical**: No user story page may replace its current production implementation until this phase is complete.

- [X] T007 Convert fixed-date appointment cases to controlled clocks or relative future factories in `apps/web/src/tests/integration/appointment-actions.test.ts` and `apps/web/src/tests/unit/appointment-validation.test.ts`
- [X] T008 Extend `User`, `Patient`, `PatientFinancialProfile`, `Appointment` and `AppointmentStatus` exactly as defined by the persistence matrix in `apps/web/prisma/schema.prisma`
- [X] T009 Create and review the non-destructive `prototype_front_reconstruction` SQL migration with nullable legacy patient fields and safe enum/default changes in `apps/web/prisma/migrations/20260827000300_prototype_front_reconstruction/migration.sql`
- [X] T010 [P] Add migration-compatibility factories for complete new records and incomplete legacy records in `apps/web/src/tests/factories/clinical-domain.ts`
- [X] T011 Add integration coverage for preserving existing users, patients, appointments, sessions and notification attempts across the new schema in `apps/web/src/tests/integration/prototype-migration-compatibility.test.ts`
- [X] T012 [P] Implement pure digit, e-mail, cents, date and time normalizers in `apps/web/src/utils/normalizers/index.ts`
- [X] T013 [P] Implement progressive CPF, CNPJ, phone, CEP, BRL and Brazilian-date masks in `apps/web/src/utils/masks/index.ts`
- [X] T014 [P] Implement `pt-BR` BRL, `dd/mm/aaaa`, 24-hour time and status formatters in `apps/web/src/utils/formatters/index.ts`
- [X] T015 Add append/delete/mid-string/paste, check-digit, leap-year, boundary and round-trip tests for T012-T014 in `apps/web/src/tests/unit/brazilian-input-utils.test.ts`
- [X] T016 [P] Implement canonical parsers for tab, period, status, search, date range and contextual-open query parameters in `apps/web/src/utils/route-state/index.ts`
- [X] T017 [P] Add safe-default and canonical-serialization tests for invalid and combined query parameters in `apps/web/src/tests/unit/route-state.test.ts`
- [X] T018 [P] Define immutable `real`, `transient` and `unavailable` descriptors in `apps/web/src/components/feedback/capabilities.ts` and reusable types in `apps/web/src/types/capabilities.ts`
- [X] T019 Build the accessible contextual unavailable dialog with focus return and no payload leakage in `apps/web/src/components/feedback/capability-notice.tsx`
- [X] T020 Add component tests proving unavailable actions perform no mutation/success and restore trigger focus in `apps/web/src/tests/component/capability-notice.test.tsx`
- [X] T021 [P] Implement meaningful-draft detection, browser navigation protection and discard confirmation in `apps/web/src/hooks/use-discard-confirmation.ts` and `apps/web/src/components/feedback/discard-confirmation.tsx`
- [X] T022 Add component tests for empty drafts, meaningful drafts, confirm/cancel and focus behavior in `apps/web/src/tests/component/discard-confirmation.test.tsx`
- [X] T023 Add the accessible shadcn/Radix primitives required by the shared shell and forms, adapted to prototype variants, in `apps/web/src/components/ui/dialog.tsx`, `apps/web/src/components/ui/sheet.tsx`, `apps/web/src/components/ui/tabs.tsx`, `apps/web/src/components/ui/select.tsx`, `apps/web/src/components/ui/accordion.tsx`, `apps/web/src/components/ui/tooltip.tsx` and `apps/web/src/components/ui/form.tsx`
- [X] T024 Establish prototype-aligned color, typography, spacing, radius, focus and responsive-container tokens without stock shadcn drift in `apps/web/src/app/globals.css`

**Checkpoint**: Foundation passes migration, utility, capability, discard and accessibility tests; page increments may begin.

---

## Phase 3: User Story 1 - Operar pelo shell responsivo (Priority: P1) 🎯 MVP

**Goal**: Preserve real e-mail/password access and deliver the responsive public/authenticated shell, navigation, notifications, user menu and resumable onboarding.

**Independent Test**: Register and log in with e-mail/password, verify Google/recovery are explicitly unavailable, then navigate every private route on desktop/mobile and resume, skip, complete and restart onboarding without losing context.

### Tests for User Story 1

- [X] T025 [P] [US1] Add login component coverage for validation, password visibility, pending state, real submit and unavailable Google action in `apps/web/src/tests/component/login-form.test.tsx`
- [X] T026 [P] [US1] Add registration component coverage for CPF mask/check digits, terms, pending state and preserved errors in `apps/web/src/tests/component/register-form.test.tsx`
- [X] T027 [P] [US1] Add password-recovery coverage proving the visible form opens an unavailable notice and never reports a sent link in `apps/web/src/tests/component/password-recovery-form.test.tsx`
- [X] T028 [P] [US1] Add UI-preference service/action tests for ownership, step clamping, skip, restart, completion, dashboard order, privacy and banner state in `apps/web/src/tests/integration/ui-preference-actions.test.ts`
- [X] T029 [P] [US1] Add shell/onboarding component tests for active route, mobile sheet, keyboard navigation, focus return, valid resume and required-step blocking in `apps/web/src/tests/component/app-shell-onboarding.test.tsx`

### `/login` increment

- [X] T030 [US1] Rebuild the real login form and prototype visual states with adapted shadcn components in `apps/web/src/components/auth/login-form.tsx` and compose it server-first in `apps/web/src/app/(public)/login/page.tsx`
- [X] T031 [US1] Validate `/login` navigation, real authentication regression, keyboard flow and both fixed viewports in `apps/web/tests/e2e/login.spec.ts`, then decide every `/login` row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

### `/criar-conta` increment

- [X] T032 [US1] Extend the shared registration Zod schema/resolver with real CPF normalization and terms acceptance in `apps/web/src/utils/validators/register.ts`
- [X] T033 [US1] Rebuild the real registration form and prototype visual states in `apps/web/src/components/auth/register-form.tsx` and compose it in `apps/web/src/app/(public)/criar-conta/page.tsx`
- [X] T034 [US1] Validate `/criar-conta` real registration, errors, responsive layout and both fixed viewports in `apps/web/tests/e2e/register.spec.ts`, then decide every registration row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

### `/recuperar-senha` increment

- [X] T035 [US1] Build the prototype-faithful recovery form as an unavailable capability with accessible explanation in `apps/web/src/components/auth/password-recovery-form.tsx` and `apps/web/src/app/(public)/recuperar-senha/page.tsx`
- [X] T036 [US1] Validate `/recuperar-senha` responsiveness, focus return and absence of fake send/success in `apps/web/tests/e2e/password-recovery.spec.ts`, then decide every recovery row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

### Authenticated shell and onboarding increment

- [X] T037 [US1] Implement `UserUiPreference` reads/upserts and serializable view models scoped to the authenticated user in `apps/web/src/services/ui-preferences/ui-preferences.ts`, `apps/web/src/actions/ui-preferences.ts` and `apps/web/src/types/ui-preferences.ts`
- [X] T038 [P] [US1] Build prototype-aligned desktop sidebar, mobile navigation sheet, route-active state and 44px targets in `apps/web/src/components/app-shell/app-navigation.tsx`
- [X] T039 [P] [US1] Build notifications, user menu, Configurações and real logout in `apps/web/src/components/app-shell/app-header.tsx`; remove the WhatsApp/message shortcut per product-owner correction
- [X] T040 [P] [US1] Build resumable next/back/skip/restart onboarding with real persisted progress and capability-aware prerequisites in `apps/web/src/components/app-shell/onboarding-tour.tsx`
- [X] T041 [US1] Authenticate, start independent preference/shell reads and compose minimal serializable shell data in `apps/web/src/app/(private)/layout.tsx`
- [X] T042 [US1] Validate desktop/mobile navigation, overlays, contextual links, logout and onboarding persistence in `apps/web/tests/e2e/app-shell.spec.ts`, then decide every shell/onboarding row in `specs/003-prototype-front-reconstruction/parity-matrix.md`
- [X] T043 [US1] Run the US1 component, integration and browser suite and record the accepted public/shell page gates in `specs/003-prototype-front-reconstruction/parity-matrix.md`

**Checkpoint**: Public auth pages and authenticated shell are independently usable; no later page is required to validate US1.

---

## Phase 4: User Story 2 - Gerenciar pacientes de ponta a ponta (Priority: P1)

**Goal**: Deliver searchable patient management, atomic two-step creation and the complete six-tab profile shell with real current data or honest capability boundaries.

**Independent Test**: Create an Avulso patient through both wizard steps, reload and find the record by each supported identifier, then open Geral, Agenda and Financeiro with real data and every remaining tab/action in its declared transient/unavailable state.

### Tests for User Story 2

- [ ] T044 [P] [US2] Expand patient validator tests for required CPF/birth/e-mail/phone, optional address, conditional emergency contact and separate consents in `apps/web/src/tests/unit/patient-validation.test.ts`
- [ ] T045 [P] [US2] Expand financial-profile validator tests for Avulso, unsupported Plano notice, method conditions and card installments without PAN/CVV in `apps/web/src/tests/unit/patient-financial-profile-validation.test.ts`
- [ ] T046 [P] [US2] Add atomic wizard integration tests for ownership, CPF/phone duplication, supported Avulso transaction, rollback and legacy rows in `apps/web/src/tests/integration/patient-wizard-actions.test.ts`
- [ ] T047 [P] [US2] Add patient-list query/action component tests for search, status, empty states and unavailable edit/archive/restore/contact controls in `apps/web/src/tests/component/patient-list.test.tsx`
- [ ] T048 [P] [US2] Add patient-profile shell tests for tab order, canonical URL state, incomplete legacy values and contextual actions in `apps/web/src/tests/component/patient-profile.test.tsx`

### `/pacientes` increment

- [ ] T049 [US2] Extend authenticated patient list/search service projections for normalized name, CPF, e-mail, phone and status filters in `apps/web/src/services/patients/patients.ts`
- [ ] T050 [US2] Rebuild responsive patient search, filters, table/cards, empty states and capability-mapped row actions in `apps/web/src/components/patients/patient-list.tsx`
- [ ] T051 [US2] Parse canonical query state server-side and compose bounded patient results in `apps/web/src/app/(private)/pacientes/page.tsx`
- [ ] T052 [US2] Validate search/filter URLs, contextual actions, accessibility and both viewports in `apps/web/tests/e2e/patients-list.spec.ts`, then decide every `/pacientes` row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

### `/pacientes/novo` increment

- [ ] T053 [US2] Extend Patient fields and reusable input/output types for the complete non-clinical wizard payload in `apps/web/src/types/patients.ts` and `apps/web/src/utils/validators/patient.ts`
- [ ] T054 [US2] Extend safe Avulso/payment/card-installment input types and conditional schema in `apps/web/src/utils/validators/patient-financial-profile.ts`
- [ ] T055 [US2] Implement authenticated CPF/phone uniqueness and atomic Patient plus supported Avulso profile creation in `apps/web/src/services/patients/create-patient-wizard.ts`
- [ ] T056 [US2] Implement `createPatientWizardAction` with shared validation, typed field errors, duplicate-submit protection, revalidation and supported redirects in `apps/web/src/actions/patients.ts`
- [ ] T057 [P] [US2] Build wizard step 1 with ordered sections, accordions, masks, conditional emergency fields and separate consent controls in `apps/web/src/components/patients/patient-wizard-personal-step.tsx`
- [ ] T058 [P] [US2] Build wizard step 2 with Avulso real flow, payment conditions, safe installments, summary and unavailable Plan/automation choices in `apps/web/src/components/patients/patient-wizard-financial-step.tsx`
- [ ] T059 [US2] Coordinate preserved form values, step validation and single final submit in `apps/web/src/components/patients/patient-wizard.tsx` and compose it in `apps/web/src/app/(private)/pacientes/novo/page.tsx`
- [ ] T060 [US2] Validate valid/invalid Brazilian inputs, atomic reload persistence, unsupported choices and both viewports in `apps/web/tests/e2e/patient-wizard.spec.ts`, then decide every `/pacientes/novo` row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

### `/pacientes/[patientId]` Geral, Financeiro and Agenda increments

- [ ] T061 [US2] Build the authenticated patient profile server view model with ownership checks, incomplete legacy handling and parallel real reads in `apps/web/src/services/patients/patient-profile.ts`
- [ ] T062 [P] [US2] Build the profile header, status, WhatsApp and capability-aware archive/edit controls plus canonical six-tab navigation in `apps/web/src/components/patients/patient-profile-shell.tsx`
- [ ] T063 [P] [US2] Build the Geral tab with real contact, identity, address, emergency, consents and chief-complaint presentation in `apps/web/src/components/patients/patient-general-tab.tsx`
- [ ] T064 [P] [US2] Rebuild the Financeiro tab around the real Avulso profile/readiness data and unavailable entry/plan/charge controls in `apps/web/src/components/patients/patient-finance-tab.tsx`
- [ ] T065 [P] [US2] Rebuild the patient Agenda tab with real upcoming/history summaries and capability-aware create/edit/recurrence controls in `apps/web/src/components/patients/patient-agenda-tab.tsx`
- [ ] T066 [US2] Parse the active tab and compose profile sections without serializing unnecessary patient data in `apps/web/src/app/(private)/pacientes/[patientId]/page.tsx`
- [ ] T067 [US2] Validate Geral, Financeiro and Agenda tab URLs, real records, legacy empty values, unavailable mutations and both viewports in `apps/web/tests/e2e/patient-profile-operational-tabs.spec.ts`, then decide their rows in `specs/003-prototype-front-reconstruction/parity-matrix.md`
- [ ] T068 [US2] Run the US2 unit, integration and browser suite and record the accepted patient page gates in `specs/003-prototype-front-reconstruction/parity-matrix.md`

**Checkpoint**: Patient list, atomic creation and operational profile tabs work independently with existing records preserved.

---

## Phase 5: User Story 3 - Operar a agenda visual completa (Priority: P1)

**Goal**: Deliver Day/Week/Month calendar parity while keeping appointment creation real and unsupported edit/reschedule/status/block operations honest.

**Independent Test**: Navigate all calendar periods, create a valid non-conflicting appointment for a ready patient, inspect its real notification result, and verify unsupported detail/edit/block flows preserve transient input but perform no mutation.

### Tests for User Story 3

- [ ] T069 [P] [US3] Expand controlled-clock appointment tests for `dd/mm/aaaa`, 24-hour bounds, type, HTTPS video, past time, overlap and readiness in `apps/web/src/tests/unit/appointment-validation.test.ts`
- [ ] T070 [P] [US3] Add pure Day/Week/Month range, positioning, navigation and timezone boundary tests in `apps/web/src/tests/unit/calendar-model.test.ts`
- [ ] T071 [P] [US3] Add agenda component tests for view switching, empty grid, create dialog, detail sheet, unavailable mutations and block-draft discard in `apps/web/src/tests/component/agenda-calendar.test.tsx`

### `/agenda` increment

- [ ] T072 [US3] Extend appointment types/schema/action/service for real create fields `type` and optional `videoUrl` while preserving ownership, overlap, readiness and notification rules in `apps/web/src/types/appointments.ts`, `apps/web/src/utils/validators/appointment.ts`, `apps/web/src/actions/appointments.ts` and `apps/web/src/services/appointments/create-appointment-with-confirmation.ts`
- [ ] T073 [P] [US3] Implement pure calendar ranges, slot positioning and status presentation in `apps/web/src/components/appointments/calendar-model.ts` and domain constants in `apps/web/src/components/appointments/constants.ts`
- [ ] T074 [US3] Add only the date/calendar dependency needed by this page and lock it in `apps/web/package.json` and `apps/web/package-lock.json`
- [ ] T075 [P] [US3] Build responsive Day/Week/Month grids, contextual header and in-grid empty states in `apps/web/src/components/appointments/agenda-calendar.tsx`
- [ ] T076 [P] [US3] Rebuild the real create dialog with Brazilian date/time controls and preserved validation values in `apps/web/src/components/appointments/appointment-create-dialog.tsx`
- [ ] T077 [P] [US3] Build appointment details and edit/reschedule/cancel/status/start-session controls with declared real or unavailable behavior in `apps/web/src/components/appointments/appointment-detail-sheet.tsx`
- [ ] T078 [P] [US3] Build the full transient schedule-block dialog with validation and discard warning, ending in unavailable save in `apps/web/src/components/appointments/schedule-block-dialog.tsx`
- [ ] T079 [US3] Parse calendar URL state, load bounded owned appointments and compose the server-first route in `apps/web/src/app/(private)/agenda/page.tsx`
- [ ] T080 [US3] Validate all views, temporal navigation, real create/WhatsApp outcome, transient controls, accessibility and both viewports in `apps/web/tests/e2e/agenda.spec.ts`, then decide every `/agenda` row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

**Checkpoint**: Agenda page passes its gate with one real mutation boundary and no simulated edit/block persistence.

---

## Phase 6: User Story 4 - Acompanhar rotina e finanças (Priority: P2)

**Goal**: Connect dashboard, cash flow and forecast through canonical filters, real existing aggregates and honest transient/unavailable finance controls.

**Independent Test**: Use dashboard links and privacy state, recover the same finance filter after reload, inspect internally consistent KPIs/tables/charts, and exercise unsupported finance/receipt/plan actions without creating data.

### Tests for User Story 4

- [ ] T081 [P] [US4] Add dashboard aggregate, bucket and contextual-link tests using existing real records and empty states in `apps/web/src/tests/unit/dashboard-view-model.test.ts`
- [ ] T082 [P] [US4] Add dashboard component tests for value privacy, banner dismissal, section order, quick actions and unavailable message controls in `apps/web/src/tests/component/dashboard.test.tsx`
- [ ] T083 [P] [US4] Add finance parser/calculation tests proving one canonical recut for KPIs, tables, flow, balance and category charts in `apps/web/src/tests/unit/finance-view-model.test.ts`
- [ ] T084 [P] [US4] Add finance component tests for responsive tabs/filters, transient entry/receipt/plan drafts and unavailable final actions in `apps/web/src/tests/component/finance.test.tsx`

### `/dashboard` increment

- [ ] T085 [US4] Build a minimal server dashboard view model from parallel owned patient, appointment, notification and supported financial-profile reads in `apps/web/src/services/dashboard/dashboard.ts`
- [ ] T086 [US4] Add page-scoped chart and drag-and-drop dependencies only if required by parity in `apps/web/package.json` and `apps/web/package-lock.json`
- [ ] T087 [P] [US4] Build quick actions, upcoming appointments, reminders, message queue, clickable KPIs and empty states in `apps/web/src/components/dashboard/dashboard-content.tsx`
- [ ] T088 [P] [US4] Build dynamically loaded charts and section reordering with persisted privacy/order preferences in `apps/web/src/components/dashboard/dashboard-charts.tsx` and `apps/web/src/components/dashboard/dashboard-preferences.tsx`
- [ ] T089 [US4] Start independent reads in parallel and compose the server-first dashboard in `apps/web/src/app/(private)/dashboard/page.tsx`
- [ ] T090 [US4] Validate contextual URLs, privacy persistence, responsive DnD fallback, empty states and both viewports in `apps/web/tests/e2e/dashboard.spec.ts`, then decide every `/dashboard` row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

### `/financeiro` and `/financeiro/previsibilidade` increments

- [ ] T091 [P] [US4] Implement immutable finance filter, KPI, chart and forecast view models without persistence in `apps/web/src/components/finance/finance-model.ts` and constants in `apps/web/src/components/finance/constants.ts`
- [ ] T092 [P] [US4] Build responsive KPI, Todos/Receitas/Despesas/Recibos/Categorias tabs, filters, tables and lazy charts in `apps/web/src/components/finance/cash-flow-view.tsx`
- [ ] T093 [P] [US4] Build fully validated transient entry, receipt and plan dialogs whose final actions open capability notices in `apps/web/src/components/finance/finance-dialogs.tsx` and schemas in `apps/web/src/utils/validators/finance-drafts.ts`
- [ ] T094 [US4] Parse canonical filters and compose the cash-flow route with no fake financial records in `apps/web/src/app/(private)/financeiro/page.tsx`
- [ ] T095 [P] [US4] Build annual calendar, monthly totals/detail, filters/search and transient confirm/cancel/edit controls in `apps/web/src/components/finance/forecast-view.tsx`
- [ ] T096 [US4] Compose forecast URL state in `apps/web/src/app/(private)/financeiro/previsibilidade/page.tsx` and validate both finance routes in `apps/web/tests/e2e/finance.spec.ts`, then decide their rows in `specs/003-prototype-front-reconstruction/parity-matrix.md`

**Checkpoint**: Dashboard and finance routes are coherent and navigable; no unsupported financial record, receipt, plan or charge is persisted.

---

## Phase 7: User Story 5 - Registrar trabalho clínico e documentos (Priority: P2)

**Goal**: Reproduce Anamnese, Prontuário/session and Documentos interactions in memory only, with explicit blocked save/autosave/upload/PDF/signature and safe discard handling.

**Independent Test**: Fill conditional Anamnese and SOAP/session fields, use mood/timer and document editor/signature interactions, attempt every final action, navigate away with content and verify no clinical/document value survives reload or appears in logs.

### Tests for User Story 5

- [ ] T097 [P] [US5] Add clinical schema tests for all Anamnese sections, manual DSM/CID, free/SOAP evolution, mood, appointment link and conditional fields in `apps/web/src/tests/unit/clinical-draft-validation.test.ts`
- [ ] T098 [P] [US5] Add clinical component tests for transient state, timer pause/resume/finalize, blocked save/autosave and confirmed discard in `apps/web/src/tests/component/clinical-tabs.test.tsx`
- [ ] T099 [P] [US5] Add document component tests for templates, editor, preview, upload selection, signature canvas, blocked final actions and no fake download in `apps/web/src/tests/component/documents-tab.test.tsx`

### Anamnese and Prontuário tab increments

- [ ] T100 [P] [US5] Define clinical section/option constants and shared transient Zod schemas without contract fields in `apps/web/src/components/clinical/constants.ts` and `apps/web/src/utils/validators/clinical-drafts.ts`
- [ ] T101 [P] [US5] Build the complete transient Anamnese form with HDA, histories, habits, mental-state exam and manual DSM/CID in `apps/web/src/components/clinical/anamnese-tab.tsx`
- [ ] T102 [P] [US5] Build chronological evolution UI, free/SOAP draft, mood, optional appointment and unavailable CRUD final actions in `apps/web/src/components/clinical/medical-record-tab.tsx`
- [ ] T103 [P] [US5] Build the in-memory session timer with pause/resume/finalize interaction and explicit unavailable persistence in `apps/web/src/components/clinical/session-workspace.tsx`
- [ ] T104 [US5] Integrate Anamnese and Prontuário tabs into `apps/web/src/app/(private)/pacientes/[patientId]/page.tsx` without passing clinical content through server props
- [ ] T105 [US5] Validate clinical conditions, timer, keyboard flow, blocked save/autosave, discard and both viewports in `apps/web/tests/e2e/patient-clinical-tabs.spec.ts`, then decide the clinical rows in `specs/003-prototype-front-reconstruction/parity-matrix.md`

### Documentos tab increment

- [ ] T106 [US5] Add `react-konva` and preview/PDF packages only if required for local parity, isolating them from the shared bundle in `apps/web/package.json` and `apps/web/package-lock.json`
- [ ] T107 [P] [US5] Build document templates, repository states, editor and preview as transient/unavailable interactions in `apps/web/src/components/documents/documents-tab.tsx` and `apps/web/src/components/documents/document-editor.tsx`
- [ ] T108 [P] [US5] Build a dynamically loaded signature canvas with clear/reset controls and evidence explanation but no signing claim in `apps/web/src/components/documents/signature-dialog.tsx`
- [ ] T109 [US5] Integrate Documentos into `apps/web/src/app/(private)/pacientes/[patientId]/page.tsx` with no upload/save/PDF/sign mutation boundary
- [ ] T110 [US5] Validate templates, editor, preview, signature, no fake upload/download/save, safe feedback and both viewports in `apps/web/tests/e2e/patient-documents-tab.spec.ts`, then decide every document row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

**Checkpoint**: All six patient tabs are now covered; clinical/document interactions are complete but deliberately non-persistent and privacy-safe.

---

## Phase 8: User Story 6 - Configurar conta, planos e mensagens (Priority: P3)

**Goal**: Deliver the full Configurações information architecture with Brazilian validation and explicit real/transient/unavailable behavior per section.

**Independent Test**: Navigate Conta, Contato, Clínica, Planos, Mensagens and Segurança, exercise all masks/conditional fields and confirm that only a named existing service may report persisted success.

### Tests for User Story 6

- [ ] T111 [P] [US6] Add settings schema tests for CPF, CNPJ, phone, CEP, optional clinic, 2 MB image constraint, plan duration/value and message placeholders in `apps/web/src/tests/unit/settings-validation.test.ts`
- [ ] T112 [P] [US6] Add settings component tests for section navigation, conditional clinic fields, transient drafts and unavailable saves/toggles in `apps/web/src/tests/component/settings.test.tsx`

### `/configuracoes` increment

- [ ] T113 [P] [US6] Define settings section metadata, capability descriptors, plan/message options and shared schemas in `apps/web/src/components/settings/constants.ts` and `apps/web/src/utils/validators/settings.ts`
- [ ] T114 [P] [US6] Build Conta, Contato/endereço and optional Clínica forms with Brazilian masks and capability-aware save actions in `apps/web/src/components/settings/account-settings.tsx`
- [ ] T115 [P] [US6] Build transient Planos list/create/remove interactions with sessions, duration and BRL rules in `apps/web/src/components/settings/billing-plan-settings.tsx`
- [ ] T116 [P] [US6] Build message templates, preview/placeholders and queue interactions with unavailable scheduling/sending in `apps/web/src/components/settings/message-settings.tsx`
- [ ] T117 [P] [US6] Build Segurança with future 2FA and channel toggles marked unavailable and no session manager in `apps/web/src/components/settings/security-settings.tsx`
- [ ] T118 [US6] Parse the active section and compose only safe authenticated account fields in `apps/web/src/app/(private)/configuracoes/page.tsx`
- [ ] T119 [US6] Validate all settings sections, masks, conditional states, unavailable actions, keyboard flow and both viewports in `apps/web/tests/e2e/settings.spec.ts`, then decide every `/configuracoes` row in `specs/003-prototype-front-reconstruction/parity-matrix.md`

**Checkpoint**: Settings route passes its page gate without implying unsupported account, plan, message or security persistence.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Prove whole-feature parity, preserve current real flows and leave durable project context.

- [ ] T120 Resolve every remaining matrix row to `equivalent`, `approved-divergence` with owner/date, or `unavailable-capability`, and verify 100% desktop/mobile coverage in `specs/003-prototype-front-reconstruction/parity-matrix.md`
- [ ] T121 [P] Audit all UI strings and rendered date/value paths for Portuguese feedback, `dd/mm/aaaa`, 24-hour time, BRL and zero `mm/dd/yyyy` occurrences in `apps/web/src`
- [ ] T122 [P] Audit authorization, LGPD minimization, safe logging and absence of clinical/document/payment/message payload persistence in `apps/web/src/actions`, `apps/web/src/services`, `apps/web/src/components/clinical`, `apps/web/src/components/documents` and `apps/web/src/components/finance`
- [ ] T123 [P] Run keyboard, focus, accessible-name, non-color-state, 44px target and intermediate-width review across `apps/web/tests/e2e`
- [ ] T124 [P] Review Server/Client boundaries, serialized props, parallel reads, Suspense stability and page-only bundle loading in `apps/web/src/app` and `apps/web/src/components`
- [ ] T125 Run regression coverage for real auth, patient, financial-profile, appointment and WhatsApp flows in `apps/web/src/tests/integration` and confirm unavailable actions create no records in `apps/web/tests/e2e`
- [ ] T126 Run Prisma generation/migration validation plus `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`, Playwright and `npm.cmd run build` from `apps/web/package.json`
- [ ] T127 Execute and record every manual smoke step and final blocker from `specs/003-prototype-front-reconstruction/quickstart.md`
- [ ] T128 [P] Update implementation status, page gates and next phase in `docs/roadmap.md` and meaningful product/architecture changes in `docs/project-overview.md`
- [ ] T129 [P] Update changed files, validation evidence, blockers and recommended next step in `docs/handoff.md`
- [ ] T130 Use the `specify-prompt-engineer` workflow to prepare the next roadmap specification brief for clinical persistence/encryption in `docs/next-spec-clinical-persistence-encryption.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** has no dependencies.
- **Phase 2 Foundational** depends on Phase 1 and blocks every page replacement.
- **US1, US2 and US3** are P1 stories and execute in that order because patients depend on the shell and agenda depends on ready patients.
- **US4 and US5** are P2 stories. Their isolated component work can overlap after Phase 2, but route acceptance follows the numbered tasks and cannot regress earlier pages.
- **US6** begins after the P1/P2 page contracts it links to are stable.
- **Phase 9** depends on all desired story/page gates; T120, T125-T127 and documentation require all six stories for full feature completion.

### Canonical Page Gates

The parity contract remains authoritative. Within the story grouping, replace only one page/route or independently reviewed patient tab at a time. The gate sequence is: public foundation, `/login`, `/criar-conta`, `/recuperar-senha`, authenticated shell/onboarding, `/dashboard`, `/pacientes`, `/pacientes/novo`, patient Geral, patient Financeiro/Agenda, `/agenda`, patient Anamnese/Prontuário, patient Documentos, `/financeiro`, `/financeiro/previsibilidade`, `/configuracoes`. If task grouping makes a later-numbered story implementation available early, its production replacement still waits for the preceding canonical gate.

### User Story Dependencies

- **US1**: independently testable after Foundation; suggested MVP.
- **US2**: needs US1 shell/auth and existing authenticated data boundaries; clinical/document tabs remain honest until US5 completes them.
- **US3**: needs US2 patient and supported financial-profile readiness for the real create flow.
- **US4**: can build view models after Foundation, but meaningful real aggregates depend on existing patient/agenda records; unavailable finance mutations remain independent.
- **US5**: needs the US2 profile shell only; it must not depend on a clinical/document backend.
- **US6**: needs the US1 shell; links to plans/messages remain usable without persistence through capability contracts.

### Parallel Opportunities

- Setup T002 and T006 can run in parallel; T003 and T004 touch separate configs before T005 consolidates scripts/dependencies.
- Foundation pure utilities T012-T014, route state T016-T017 and capability types T018 can run in parallel after schema direction is fixed.
- Tests marked `[P]` within each story can be written concurrently and must fail for the missing behavior before implementation.
- Domain components marked `[P]` can run concurrently only when their schemas, constants and Server/Client payload contracts are stable.
- Browser/parity gate tasks are deliberately sequential because they update one matrix and authorize page replacement.
- Cross-cutting audits T121-T124 and documentation drafts T128-T129 can run in parallel after implementation stabilizes.

## Parallel Examples

### User Story 1

```text
Task T025: apps/web/src/tests/component/login-form.test.tsx
Task T026: apps/web/src/tests/component/register-form.test.tsx
Task T028: apps/web/src/tests/integration/ui-preference-actions.test.ts
Task T029: apps/web/src/tests/component/app-shell-onboarding.test.tsx
```

### User Story 2

```text
Task T044: apps/web/src/tests/unit/patient-validation.test.ts
Task T045: apps/web/src/tests/unit/patient-financial-profile-validation.test.ts
Task T047: apps/web/src/tests/component/patient-list.test.tsx
Task T048: apps/web/src/tests/component/patient-profile.test.tsx
```

### User Story 3

```text
Task T069: apps/web/src/tests/unit/appointment-validation.test.ts
Task T070: apps/web/src/tests/unit/calendar-model.test.ts
Task T071: apps/web/src/tests/component/agenda-calendar.test.tsx
```

### User Story 4

```text
Task T081: apps/web/src/tests/unit/dashboard-view-model.test.ts
Task T082: apps/web/src/tests/component/dashboard.test.tsx
Task T083: apps/web/src/tests/unit/finance-view-model.test.ts
Task T084: apps/web/src/tests/component/finance.test.tsx
```

### User Story 5

```text
Task T097: apps/web/src/tests/unit/clinical-draft-validation.test.ts
Task T098: apps/web/src/tests/component/clinical-tabs.test.tsx
Task T099: apps/web/src/tests/component/documents-tab.test.tsx
```

### User Story 6

```text
Task T111: apps/web/src/tests/unit/settings-validation.test.ts
Task T112: apps/web/src/tests/component/settings.test.tsx
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational.
2. Complete US1, one public/shell page gate at a time.
3. Stop and validate real auth, responsive navigation and onboarding independently.
4. Do not claim the reconstruction feature complete; US1 is only the demonstrable foundation MVP.

### Incremental Delivery

1. Accept exactly one page/route or patient-tab increment at a time using `parity-matrix.md`.
2. Keep the current production page until its replacement has no pending row.
3. Classify controls before coding: `real`, `transient` or `unavailable`.
4. Run targeted tests and fixed-viewport Playwright evidence for the increment.
5. Obtain product-owner approval for every divergence before acceptance.
6. Re-run previous real-flow regression tests after each accepted replacement.

### Quality Gate

The feature is complete only after T120-T130: 100% decided parity rows, preserved real slice `002` behavior, zero fake success/mock persistence/`mm/dd/yyyy`, accessibility and performance reviews, clean Prisma/lint/type/test/Playwright/build results, recorded quickstart smoke, updated durable documentation and a next-spec brief.

## Notes

- `[P]` means different files and no dependency on an incomplete task; shared `package.json`, Prisma schema and parity-matrix edits are intentionally serialized.
- Tests precede implementation inside each story and use controlled time.
- `shadcn/ui` is an implementation mechanism; stock styling is not accepted as parity.
- Do not add Route Handlers for internal page reads or mutate unsupported domains.
- Do not store transient domain data in `localStorage`, cookies, URL, cache, analytics, logs or mock stores.
- Commit after each task or coherent page gate only when explicitly requested.
