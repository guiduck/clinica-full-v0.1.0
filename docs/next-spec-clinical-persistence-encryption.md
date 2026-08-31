# Proxima Spec: Persistencia Clinica e Protecao de Dados Sensiveis

> Brief revalidado com `specify-prompt-engineer` em 2026-08-31 contra as
> superfícies finais transitórias de Anamnese, Prontuário, sessão e Agenda.
> Não executar `/speckit.specify` enquanto a matriz integral da feature 003
> estiver aberta.
> Preservar também o contrato de localização aprovado: datas em `dd/mm/aaaa`,
> horários em 24 horas e seletores/dropdowns com largura integral do campo.

Create a feature specification for persistent clinical records with an explicit
security, privacy, retention and audit model.

Primary user: professional therapist authenticated as the sole owner of the account.

Goal: turn the transient Anamnese, Prontuario, SOAP evolution and session workflow
from the reconstructed prototype into a real server-side clinical record without
weakening LGPD protections or implying end-to-end encryption that the architecture
cannot provide.

In scope:
- persist Anamnese sections, free-form and SOAP evolutions, mood, manual DSM/CID
  reference and optional appointment linkage;
- persist the session finalize workflow and its relationship to appointment status;
- define ownership, version history, correction/amendment and deletion/retention
  semantics for clinical content;
- define encryption in transit and at rest, application-level encryption only where
  justified, key ownership/rotation and backup implications;
- authorize every read and mutation by the authenticated professional owner;
- add audit events for create, view, update, finalize and delete/amend operations
  without logging clinical bodies;
- migrate the transient UI contracts from feature 003 to real Server Actions and
  services while preserving the accepted prototype behavior;
- preserve the current progress model, complete anamnesis sections, mood slider,
  free text and optional SOAP accordion without storing drafts in browser storage;
- cover safe errors, retries, duplicate submission, concurrent editing and recovery
  from interrupted saves.

Constraints:
- Next.js modular monolith in `apps/web`, server-first with Server Components,
  Server Actions, services, Prisma and PostgreSQL;
- shadcn/ui, React Hook Form and shared Zod schemas remain the frontend contract;
- dates are shown as `dd/mm/aaaa`, time uses 24-hour format and DSM/CID remains a
  manual field without embedded copyrighted catalog content;
- never place clinical bodies in URLs, cookies, localStorage, analytics, audit logs,
  error telemetry or notification payloads;
- preserve tenant isolation even though the MVP currently has one professional per
  account;
- do not call transport/database encryption “E2EE”; document the actual threat model
  and accepted residual risks;
- keep documents, signatures, AI/transcription and patient portal outside this slice
  unless a minimal interface is required for consistency.

Integrations:
- Prisma/PostgreSQL for canonical records and version metadata;
- current database-backed HttpOnly session and ownership services;
- existing Appointment records for optional linkage and safe status transitions;
- future managed secrets/KMS provider must be represented as a boundary, not mocked
  as a successful production capability.

Acceptance expectations:
- a professional can create, revisit, amend and finalize their own clinical record
  with the exact validated UI flow accepted in feature 003;
- another owner cannot read, infer or mutate the record by route, action or service;
- concurrent or repeated submissions do not silently overwrite or duplicate data;
- every sensitive action produces metadata-only audit evidence with actor, action,
  record identifier and timestamp;
- retention, correction and deletion behavior is documented and testable before
  destructive controls are enabled;
- encryption and key-management decisions include operational recovery, rotation,
  backups and local-development behavior;
- unit, integration, migration and fixed-viewport browser tests prove persistence,
  authorization, privacy-safe feedback and regression of the accepted UI.

Out of scope:
- end-to-end encryption claims;
- AI summaries, audio transcription or autonomous clinical suggestions;
- structured DSM/CID search or copyrighted diagnostic criteria;
- patient-facing access, multi-professional sharing or secretary roles;
- document/PDF storage and electronic signatures;
- production key-provider implementation unless selected explicitly during clarify.

High-impact decisions for `/speckit.clarify`:
- amendment-only history versus editable versions and which events require a reason;
- retention/deletion policy and legal hold expectations;
- whether application-level field encryption is required in the first release;
- key provider, rotation and disaster-recovery ownership for production;
- conflict strategy for simultaneous edits and appointment-finalization atomicity.
