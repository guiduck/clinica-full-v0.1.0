# Server Action Contracts

These contracts describe internal app actions called by forms in `apps/web`.
They are not public HTTP APIs.

## `createPatientAction(input)`

**Purpose**: Create a patient for the authenticated therapist.

**Input**:
- `name`: string, required
- `phone`: string, required
- `email`: string, optional
- `cpf`: string, optional
- `birthDate`: string/date, optional
- `notes`: string, optional
- `whatsappConsent`: boolean
- `intent`: `save` or `save_and_go_to_finance`

**Success**:
- Creates `Patient`.
- Revalidates patient list/dashboard paths.
- If `intent=save`, returns or redirects to patient detail/list.
- If `intent=save_and_go_to_finance`, redirects to the patient finance tab with
  query params that focus payment setup.

**Errors**:
- unauthenticated
- invalid input
- duplicate normalized phone for user
- duplicate normalized CPF for user when CPF is present

## `upsertPatientFinancialProfileAction(patientId, input)`

**Purpose**: Create or update payment readiness data for a patient.

**Input**:
- `preferredPaymentMethod`: `pix` | `card` | `cash` | `insurance`
- `defaultSessionPriceCents`: positive integer
- method-specific fields:
  - PIX: key/type fields required by validator
  - card: provider-safe token/reference and display metadata; no raw number/CVV
  - cash: no extra credential required
  - insurance: payer/insurance identification and optional member/authorization info

**Success**:
- Creates or updates `PatientFinancialProfile`.
- Marks patient financially ready when method-specific validation passes.
- Revalidates patient detail, patient finance, dashboard/agenda paths as needed.

**Errors**:
- unauthenticated
- patient not found for current therapist
- invalid or incomplete method-specific data
- attempted raw card storage

## `createAppointmentAction(input)`

**Purpose**: Create an appointment and attempt WhatsApp confirmation.

**Input**:
- `patientId`: required
- `startsAt`: required date/time
- `endsAt`: required date/time

**Preconditions**:
- authenticated therapist
- patient belongs to therapist
- patient is selectable for scheduling
- patient has complete financial profile
- WhatsApp/Twilio configuration is present
- appointment is not in the past
- `startsAt < endsAt`
- no overlapping appointment exists for same therapist

**Success**:
- Creates `Appointment` with `agendada`.
- Creates `NotificationAttempt` with `pendente`.
- Calls notification service.
- Updates notification to `enviado` or `falhou`.
- Revalidates agenda, dashboard, patient detail, and patient agenda paths.

**Errors**:
- unauthenticated
- patient not found
- financial profile missing/incomplete
- WhatsApp configuration missing
- invalid time range or past date
- overlapping appointment
- unexpected provider failure after appointment persistence should be represented
  as a failed notification status, not by hiding the appointment.
