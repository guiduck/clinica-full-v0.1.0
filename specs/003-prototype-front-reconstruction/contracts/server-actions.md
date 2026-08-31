# Contract: Server Actions and Real Mutation Boundaries

## General Contract

Every action:

- calls `requireUser()` internally;
- accepts `unknown`/`FormData` and validates with the domain Zod schema;
- scopes all reads and writes by authenticated `userId`;
- returns a serializable state with field/form errors or redirects after success;
- never logs sensitive payloads;
- revalidates only affected paths/tags;
- keeps `redirect()`/`notFound()` outside catch blocks or rethrows framework control flow.

## Existing actions retained

### Login / registration / logout

- E-mail/password flows remain real.
- Google and password-recovery controls do not invoke a fake action.

### `createAppointmentAction`

Accepted input:

```text
patientId: owned patient id
type: known appointment type
date: dd/mm/aaaa user input -> canonical local date
startTime: HH:mm
endTime: HH:mm
videoUrl?: valid HTTPS URL
```

Server conversion produces `startsAt`/`endsAt` for `America/Sao_Paulo`. It preserves
financial/WhatsApp readiness, overlap and past-time validation and records the real
notification attempt. Edit, reschedule, recurrence, status changes and schedule
blocks do not call this action.

### `upsertPatientFinancialProfileAction`

Supports only the existing real `Avulso` path and payment methods PIX, card, cash
and insurance. It accepts positive BRL value, method-specific safe fields and
`cardInstallments` (1 or 2–12). It rejects raw PAN/CVV and unsupported billing-plan
side effects.

## New/expanded actions

### `createPatientWizardAction`

Performs one production transaction for the supported wizard path:

1. validate complete step 1 and supported step 2;
2. check normalized phone/CPF uniqueness for the authenticated user;
3. create Patient with expanded non-clinical fields;
4. create PatientFinancialProfile for the supported Avulso path;
5. commit atomically;
6. redirect to patient profile or contextual agenda confirmation.

Unsupported Plan, welcome-message, contract-generation or automation selections do
not reach the action; their controls open the capability notice.

### `updateUserUiPreferenceAction`

Accepted operation union:

```text
advance_onboarding(step)
skip_onboarding
restart_onboarding
complete_onboarding
set_dashboard_order(knownSectionKeys[])
set_financial_visibility(hidden)
dismiss_news_banner
```

The action derives `userId` from the session and upserts only that user's preference.
Unknown section keys, duplicate keys and invalid steps are rejected.

## Explicitly absent actions

This feature does not add mutation endpoints for:

- Google auth or password recovery;
- patient editing/archiving/restoring if not separately implemented by an existing approved task;
- appointment edit/reschedule/cancel/status/recurrence/block;
- clinical records or autosave;
- finance entries, billing plans, receipts or charges;
- document upload/save/PDF/signature;
- message templates/queue or inbound WhatsApp replies;
- settings domains without an existing production service.

Their UI follows `interaction-capabilities.md`.
