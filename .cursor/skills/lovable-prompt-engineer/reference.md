# Lovable Prompt Engineer Reference

## Recommended Prompt Shape

```markdown
Title: clinica-full - <slice name>

Create a Lovable prototype for a SaaS used by therapists and psychologists.

Context:
- Single professional MVP
- Modules: pacientes, agenda, prontuario, financeiro, documentos
- WhatsApp confirmations are simple `sim/nao`
- Receipts are internal PDFs
- Signature happens in-app with modal + canvas + PDF

Primary user:
- autonomous therapist / psychologist

Optional future user:
- patient portal user

Deliver these screens:
- ...

Design direction:
- calm clinical SaaS
- trustworthy, minimal noise
- subtle warmth
- high readability

Design tokens:
- brand.primary: ...
- bg.canvas: ...
- bg.surface: ...
- text.primary: ...
- status.success: ...
- radius.md: ...
- shadow.sm: ...

UX requirements:
- clear status feedback
- strong form validation
- safe destructive actions
- mobile-first adaptations
- accessible contrast

Out of scope:
- ...
```

## Recommended Token Style
- Use 1 main brand color and 1 supporting accent at most.
- Keep neutrals dominant for data-heavy screens.
- Reserve saturated colors for actions and status only.
- Use semantic status tokens instead of arbitrary per-screen colors.
- Favor `12px / 16px / 24px / 32px` spacing rhythm unless the screen needs denser tables.

## SaaS Screen Heuristics
- Dashboards must answer `what matters now` and `what should I do next`.
- Forms must reduce recall with visible examples and labels.
- Schedules must show status clearly and support quick edits.
- Patient records must prioritize chronology and auditability.
- Financial screens must distinguish `paid`, `pending`, and `overdue` instantly.
