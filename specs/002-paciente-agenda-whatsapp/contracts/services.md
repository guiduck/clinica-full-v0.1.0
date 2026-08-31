# Service Contracts

## Patients Service

### `createPatient(userId, input)`

Creates one patient scoped to `userId`.

**Guarantees**:
- Normalizes phone and CPF.
- Enforces per-user uniqueness for normalized phone and normalized CPF.
- Does not create data for another user.

### `searchPatients(userId, query, filters)`

Returns user-scoped patients for list/select controls.

**Guarantees**:
- Searches by name, phone, email, CPF where present.
- Excludes archived/inactive patients from scheduling selectors by default.

## Patient Financial Profile Service

### `upsertPatientFinancialProfile(userId, patientId, input)`

Creates or updates payment readiness data.

**Guarantees**:
- Patient belongs to `userId`.
- Validates only the fields required for selected method.
- Rejects raw card numbers/CVV.
- Stores card provider references only when card is used.
- Computes readiness used by appointment creation.

## Appointment Service

### `createAppointmentWithConfirmation(userId, input, deps)`

Creates appointment and outbound notification attempt.

**Dependencies**:
- `whatsappSender`: adapter implementing `sendAppointmentConfirmation`.
- `now`: injectable clock for tests.

**Guarantees**:
- Verifies user-scoped patient.
- Verifies complete financial profile.
- Verifies WhatsApp configuration before appointment creation.
- Rejects overlap for same `userId`.
- Persists appointment and notification attempt consistently.
- Does not process inbound WhatsApp replies.

## Notification Service

### `sendAppointmentConfirmation(userId, appointmentId)`

Sends or attempts to send the WhatsApp confirmation message for an existing
appointment.

**Guarantees**:
- Uses only transactional confirmation copy.
- Message instructs patient to answer `sim` or `nao`.
- Updates notification attempt to `enviado` or `falhou`.
- Does not log provider secrets or sensitive patient data.

## WhatsApp Sender Adapter

### `sendAppointmentConfirmationMessage(payload)`

**Payload**:
- `to`: normalized WhatsApp phone
- `patientName`: message personalization
- `appointmentStartsAt`: date/time
- `therapistName`: sender context

**Result**:
- success with provider message id
- failure with safe operational reason

**Configuration rule**:
- Missing provider configuration blocks appointment creation before this adapter
  is invoked in production behavior.
