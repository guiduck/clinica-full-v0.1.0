# Data Model: Paciente, Agenda, Financeiro Inicial e WhatsApp

## User

Existing authenticated therapist account.

**Relationships**:
- has many `Patient`
- has many `Appointment`
- has many `NotificationAttempt`

## Patient

Represents a patient managed by one therapist.

**Fields**:
- `id`: stable identifier
- `userId`: owning therapist
- `name`: required display name
- `phone`: required original phone input
- `normalizedPhone`: required normalized phone for uniqueness/search
- `email`: optional
- `cpf`: optional original CPF
- `normalizedCpf`: optional normalized CPF for uniqueness/search
- `birthDate`: optional date
- `notes`: optional administrative notes for this slice
- `whatsappConsent`: boolean
- `status`: `ativo`, `inativo`, `arquivado`
- `createdAt`, `updatedAt`

**Validation rules**:
- `name` required and trimmed.
- `phone` required and must normalize to a valid Brazilian/contact phone shape
  accepted by the app.
- `normalizedPhone` unique per `userId`.
- `normalizedCpf` unique per `userId` when present.
- Archived/inactive patients are not selected by default for new appointments.

**Relationships**:
- belongs to `User`
- has one `PatientFinancialProfile`
- has many `Appointment`

## PatientFinancialProfile

Represents the patient's initial payment setup for appointment readiness.

**Fields**:
- `id`
- `userId`: owning therapist
- `patientId`: patient
- `preferredPaymentMethod`: `pix`, `card`, `cash`, `insurance`
- `defaultSessionPriceCents`: required positive integer
- `currency`: default `BRL`
- `pixKeyType`: optional for PIX
- `pixKey`: optional for PIX
- `cardProvider`: optional for card
- `cardPaymentMethodRef`: optional provider-safe token/reference for card
- `cardBrand`: optional display metadata
- `cardLast4`: optional display metadata
- `cardHolderName`: optional display metadata
- `insuranceName`: optional for insurance
- `insuranceMemberId`: optional for insurance
- `insuranceAuthorizationInfo`: optional for insurance
- `isComplete`: derived or persisted readiness flag
- `createdAt`, `updatedAt`

**Validation rules**:
- Every profile requires `preferredPaymentMethod` and `defaultSessionPriceCents`.
- PIX requires method-specific PIX data.
- Card requires provider-safe card reference/token or agreed non-sensitive provider
  metadata. Never persist raw card number or CVV.
- Cash requires no external credential beyond method and value.
- Insurance requires at least payer/insurance identification.
- One financial profile per patient.

**Relationships**:
- belongs to `User`
- belongs to `Patient`

## Appointment

Represents a scheduled clinical session.

**Fields**:
- `id`
- `userId`: owning therapist
- `patientId`
- `startsAt`
- `endsAt`
- `status`: `agendada`, future statuses can be added later
- `confirmationStatus`: mirrors or derives from latest notification attempt in
  this slice; initial user-facing state is tied to outbound confirmation status
- `createdAt`, `updatedAt`

**Validation rules**:
- Patient must belong to the authenticated user.
- Patient must not be archived/inactive for new appointment selection.
- Patient must have a complete financial profile.
- WhatsApp must be configured before appointment creation.
- `startsAt` must be before `endsAt`.
- Past appointments are rejected for creation in this slice.
- Appointment intervals must not overlap another appointment for the same user.

**Relationships**:
- belongs to `User`
- belongs to `Patient`
- has many `NotificationAttempt`

## NotificationAttempt

Represents one outbound WhatsApp confirmation attempt.

**Fields**:
- `id`
- `userId`: owning therapist
- `patientId`
- `appointmentId`
- `channel`: `whatsapp`
- `status`: `pendente`, `enviado`, `falhou`
- `recipientPhone`: normalized destination phone
- `provider`: `twilio`
- `providerMessageId`: optional
- `failureReason`: optional safe operational reason
- `sentAt`: optional
- `createdAt`, `updatedAt`

**Validation rules**:
- Must belong to the same `userId` as appointment and patient.
- Status must be one of `pendente`, `enviado`, `falhou`.
- Failure reason must not include secrets, raw provider credentials, or sensitive
  clinical content.
- Inbound WhatsApp response records are out of scope.

**Relationships**:
- belongs to `User`
- belongs to `Patient`
- belongs to `Appointment`

## State Transitions

### PatientFinancialProfile Readiness

```text
missing -> incomplete -> complete
```

- `missing`: no profile exists.
- `incomplete`: profile exists but lacks required method-specific data.
- `complete`: method, value, and method-specific required data are present.

Only `complete` permits appointment creation.

### Appointment Creation

```text
requested -> validated -> agendada
```

- `requested`: server action receives form payload.
- `validated`: service confirms patient ownership, financial readiness, WhatsApp
  configuration, valid time range, no overlap.
- `agendada`: appointment is persisted and notification attempt begins.

### Notification Attempt

```text
pendente -> enviado
pendente -> falhou
```

- `pendente`: attempt created before/while provider call is in progress.
- `enviado`: provider accepted/sent message and returned success metadata.
- `falhou`: provider call failed or validation prevents the outbound attempt after
  an appointment is already in the workflow.
