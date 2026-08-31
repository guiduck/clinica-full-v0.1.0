---
name: specify-prompt-engineer
description: Tighten raw feature requests into better structured prompts for Spec Kit workflows. Use before `/speckit.specify`, `/speckit.clarify`, or `/speckit.plan` when the request is broad, mixed with business context, or likely to produce ambiguous specs, plans, or clarifications.
---

# Specify Prompt Engineer

## Purpose
Turn messy product requests into a compact, high-signal brief that improves Spec Kit outputs without changing user intent.

## Read First
When this project has them, read:
- `docs/project-overview.md`
- `docs/specs/mvp-product-spec.md`
- `docs/decisions/0001-mvp-stack.md`
- `docs/backlog/spec-kit-backlog.md`
- `docs/roadmap.md`
- `docs/handoff.md`

## Workflow
1. Extract the real feature goal from the raw request.
2. Remove side commentary, repeated context, and implementation noise unless it is explicitly required.
3. Preserve domain terms exactly when they matter: `terapeuta`, `paciente`, `prontuario`, `Twilio`, `Stripe`, `react-konva`, `react-pdf`, `DSM/CID`.
4. Split the request into:
   - actor
   - outcome
   - scope
   - constraints
   - dependencies/integrations
   - acceptance expectations
   - explicit out-of-scope items
5. Prefer project defaults already decided in `docs/` over reopening old decisions.
6. If something is still ambiguous, surface only the few questions that materially change scope, data model, UX behavior, or compliance.

## Output Modes
### For `/speckit.specify`
Produce a short feature brief focused on `what` and `why`, not implementation detail overload.

### For `/speckit.clarify`
Convert ambiguity into crisp decision points with small, mutually exclusive options.

### For `/speckit.plan`
Convert the feature into a planning brief anchored in the accepted stack and domain constraints from `docs/`.

## Default Project Assumptions
Unless the user overrides them, assume:
- MVP is for `profissional autonomo individual`
- patient WhatsApp confirmations are only `sim/nao`
- `DSM/CID` is manual input only
- receipt is an internal PDF based on payment data from the app
- signature is a simple in-app signature with evidence, not advanced provider-backed signing
- patient portal is future scope, not MVP scope

## Guardrails
- Do not silently expand the feature into multi-tenant or multi-role.
- Do not promote future-phase AI ideas into MVP scope unless the user explicitly asks.
- Do not convert business requirements into low-level implementation tasks here.
- Do not contradict accepted ADRs unless the user explicitly changes direction.

## Output Template
Use this structure when helpful:

```markdown
## Feature Intent
- Goal:
- Primary actor:
- Business value:

## In Scope
- ...

## Constraints
- ...

## Integrations
- ...

## Acceptance Shape
- ...

## Out of Scope
- ...

## Open Questions
- ...
```

## Additional Reference
- For concrete output shapes, see [reference.md](reference.md)
