# Contract: Interaction Capability Modes

## Mode: real

- Initial data comes from authenticated server reads.
- Mutation validates the shared Zod schema again on the server.
- Server Action calls a domain service scoped to the authenticated user.
- Success appears only after persistence/integration succeeds.
- Affected routes are revalidated.
- Expected failures preserve recoverable form values and show Portuguese feedback.

Real capabilities in this feature:

- e-mail/password login, registration and logout;
- patient search/read/create with the expanded create fields;
- patient financial-profile upsert for supported Avulso/payment paths;
- appointment list/create and outbound confirmation attempt;
- onboarding/dashboard UI preference updates.

## Mode: transient

- Fields, masks, validation, conditional sections, preview, timers and other local
  interactions reproduce the prototype.
- State exists only within the current mounted interaction boundary.
- No domain value is written to database, cookie, browser storage, URL, logs or analytics.
- Save/autosave/finalize opens the contextual notice instead of returning success.
- Closing/navigating with meaningful input requires confirmation of discard.

Required transient areas include Anamnese, Prontuário, unsupported appointment
editing/rescheduling/blocks, finance entries/plans/receipts, document editing,
signature canvas and message template/queue editing.

## Mode: unavailable

- Control remains visible and semantically operable.
- Activation opens an accessible dialog/notice with title, explanation and safe next action.
- It must not mutate local domain lists, enqueue work, upload, send, generate, sign,
  download fake content or show a success toast.
- The triggering control regains focus when the notice closes.

## Standard Notice Result

```text
title: string
description: string
capabilityKey: stable string
availableNow: false
mutationPerformed: false
```

No patient, clinical, financial or message payload is included in the notice.

## Authentication-specific mapping

- E-mail/password login and registration: `real`
- Google login: `unavailable`
- Password recovery send: `unavailable`
- 2FA and session management: `unavailable`

## Conflict resolution

If a control could be interpreted as both transient and real, the default is
`unavailable` until the parity matrix names the authenticated service/action and
its tests. A visual prototype behavior never grants persistence authority by itself.
