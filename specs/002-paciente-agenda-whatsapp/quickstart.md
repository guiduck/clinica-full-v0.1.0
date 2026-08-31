# Quickstart: Paciente, Agenda, Financeiro Inicial e WhatsApp

## Prerequisites

```powershell
cd C:\Users\guilherme\Downloads\clinica-full\apps\web
docker compose up -d postgres
npm install
```

Set local environment variables in `apps/web/.env`:

```env
DATABASE_URL="postgresql://clinica:clinica@localhost:5433/clinica_agil?schema=public"
SESSION_SECRET="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_FROM="whatsapp:+..."
```

Use test/sandbox credentials for WhatsApp during development. Missing WhatsApp
configuration must block appointment creation for this slice.

## Database Workflow

After schema changes:

```powershell
npx prisma validate
npm run db:migrate
npm run db:generate
```

For local exploration before committing a migration, `npm run db:push` is acceptable,
but final implementation should include a migration.

## Run Checks

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## Manual Demo Path

1. Start the app:

   ```powershell
   npm run dev
   ```

2. Log in or create an account using the existing auth flow.
3. Open the private patients area.
4. Create a patient with name, phone, and WhatsApp consent.
5. Use `Salvar e ir para o financeiro`.
6. Complete the patient's financial profile:
   - choose one of PIX, cartao, dinheiro, convenio
   - set default session price
   - fill only fields required by the chosen method
   - for card, use provider-safe reference/token behavior, never raw card storage
7. Create an appointment for the patient.
8. Verify overlapping appointments are rejected.
9. Verify missing payment profile blocks appointment creation.
10. Verify missing WhatsApp configuration blocks appointment creation.
11. Verify a successful configured flow creates appointment and notification
    attempt with `pendente`, then `enviado` or `falhou`.

## Test Focus

- patient validator: required fields, phone normalization, optional CPF
- duplicate patient prevention by normalized phone/CPF per user
- financial profile validator per payment method
- card data safety: raw card number/CVV rejected
- appointment validator: time range, past date
- appointment service: financial readiness, WhatsApp config, overlap prevention
- notification service: status transitions and safe failure reason
- server action redirects/revalidation for `Salvar e ir para o financeiro`
