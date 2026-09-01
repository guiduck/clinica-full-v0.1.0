# Quickstart: Reconstrução Integral do Frontend

## Prerequisites

- Node.js compatible with the existing Next.js 15.2 project
- Docker Desktop for local PostgreSQL
- Working directory: `apps/web`
- Environment variables copied from `.env.example`
- Frozen prototype submodule at `226e5ab6811c5dce717fa12b404370b4fbb2663e`

On Windows PowerShell, use `npm.cmd` when execution policy blocks `npm.ps1`.

## Initial setup

```powershell
docker compose up -d
npm.cmd install
npm.cmd run db:generate
```

When the implementation adds the approved narrow schema changes:

```powershell
npm.cmd run db:migrate -- --name prototype-front-reconstruction
```

Review generated SQL before accepting any reset or destructive change. Existing
patient, appointment, notification and session rows must remain intact.

## Page-by-page implementation loop

For each page in `contracts/page-parity.md`:

1. Confirm the reference submodule commit.
2. Enumerate page flows/states in the parity matrix for desktop and mobile.
3. Mark each interaction `real`, `transient`, or `unavailable` before coding.
4. Preserve the current production page until the replacement passes its gate.
5. Add only the shadcn primitives and page-specific dependencies required.
6. Implement Server Component orchestration and focused Client Components.
7. Add schemas, resolvers, masks, formatters, constants and hooks in domain folders.
8. Add targeted tests and browser evidence.
9. Obtain product approval for every divergence.
10. Mark the page complete only after no matrix row remains pending.

## Targeted validation

Examples during a page slice:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test -- patient
npm.cmd run test -- appointment
```

Component tests use `.test.tsx` with jsdom; services remain Node tests. Date-sensitive
tests use controlled clocks or relative future dates.

Browser validation uses the page's Playwright test at:

- desktop: `1440x900`
- mobile: `390x844`

Evidence covers navigation, keyboard/focus, dialogs/sheets, validation, unavailable
notices, transient discard warnings and responsive layout. Screenshots supplement,
but do not replace, behavioral assertions.

## Full feature gate

Run from `apps/web`:

```powershell
npm.cmd run db:generate
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Run the planned Playwright suite after starting the dev or production server. The
feature is ready only when:

- every route/tab in the inventory passes the page contract;
- all parity rows are decided;
- no `mm/dd/yyyy`, mock persistence or fake success remains;
- existing patient/financial/agenda/WhatsApp flows still pass;
- no unapproved divergence remains;
- security, accessibility and bundle/performance checks pass.

## Manual smoke path

1. Register and log in with e-mail/password.
2. Complete or skip onboarding, navigate away and verify its persisted state.
3. Create a patient through both wizard steps using valid Brazilian inputs.
4. Confirm the patient and financial profile exist after reload.
5. Create a non-conflicting appointment and inspect its real WhatsApp attempt state.
6. Navigate dashboard cards and patient tabs using recoverable URL context.
7. Fill a clinical draft, attempt save, confirm the unavailable notice, then verify
   discard confirmation on exit and absence after reload.
8. Activate finance/document/message controls without services and confirm that no
   fake record, send, upload, download or success appears.
9. Repeat primary navigation and overlays at desktop and mobile viewports.

## Known pre-implementation blockers

- The two appointment tests with fixed past dates must be converted to controlled or
  relative time before the agenda page gate can pass.
- Existing npm audit findings require controlled review; do not apply automatic
  major upgrades as part of this feature.
- Clinical persistence remains blocked until a separate encryption design is approved.

## Registro do gate final — 2026-08-31

- Prisma validate/generate: aprovado.
- `npm.cmd run lint`: aprovado.
- `npm.cmd run typecheck`: aprovado.
- `npm.cmd run test`: 30 arquivos e 87 testes aprovados.
- `npm.cmd run build`: aprovado; 22 rotas, 102 kB compartilhados; Dashboard
  272 kB e Financeiro 267 kB de First Load JS são os maiores bundles.
- `npm.cmd run test:e2e`: 17 cenários aprovados e 2 mutações reais puladas
  intencionalmente no mobile; desktop 1440x900 e mobile 390x844.
- `npm.cmd audit --omit=dev`: 0 vulnerabilidades após upgrade controlado.
- Smoke: cadastro/login, onboarding, criação atômica de paciente, perfil,
  rascunhos clínicos/documentais, Agenda 24h, Financeiro, Previsibilidade e
  Configurações cobertos pela jornada real e pelas evidências em
  `output/playwright/evidence`.
- Matriz: 384/384 decididas, sem `pending`.

Pendências não bloqueantes: 11 testes granulares de componente/unidade,
Twilio sandbox real, CSP e decisão do workspace com múltiplos lockfiles.
