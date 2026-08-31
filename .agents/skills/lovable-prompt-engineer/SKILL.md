---
name: lovable-prompt-engineer
description: Generate stronger Lovable prompts for this clinic project by grounding them in the project docs, Lovable reference templates, UX heuristics, and design-token best practices. Use when creating or refining Lovable prototype prompts, UI direction, screen architecture, or design-system guidance.
---

# Lovable Prompt Engineer

## Purpose
Create Lovable prompts that are specific, product-aware, and visually coherent with the actual project decisions in `docs/`.

This skill is for Lovable prompt generation only. It is not part of the Spec Kit workflow.

## Read First
Always read the current project docs before writing the prompt:
- `docs/project-overview.md`
- `docs/specs/mvp-product-spec.md`
- `docs/decisions/0001-mvp-stack.md`
- `docs/backlog/spec-kit-backlog.md`
- `docs/roadmap.md`
- `docs/handoff.md`

Also read the local Lovable references:
- `references/lovable-template/prompt-template-1.md`
- `references/lovable-template/prompt-template-2.md`
- `references/lovable-template/prompt-template-3.md`

## UX Heuristics To Apply
Use these heuristics when shaping the prompt:
- visibility of system status
- match with real-world language
- user control and safe exits
- consistency through reusable tokens and patterns
- error prevention in forms and scheduling
- recognition over recall
- progressive disclosure
- minimalist information hierarchy
- clear error recovery
- contextual help

Also apply:
- strong mobile-first layout decisions
- low cognitive load for forms
- clear next actions on dashboards
- accessible contrast and touch targets

## Product-Specific Design Direction
For this project, bias the design toward:
- calm, trustworthy, clinical admin software
- subtle warmth, not cold enterprise-only visuals
- high legibility for long-form records and forms
- easy scanability for agenda, financeiro, prontuario, documentos
- clear status chips, timelines, cards, and side panels

Avoid:
- flashy startup gradients everywhere
- social-app visual language
- excessive glassmorphism
- decorative complexity that hurts operational speed

## Prompt Construction Workflow
1. Identify the Lovable target:
   - full product prototype
   - dashboard
   - patient detail area
   - agenda flow
   - finance flow
   - documents/signature flow
   - patient portal future concept
2. Pull only the relevant requirements from `docs/`.
3. Choose a coherent visual direction:
   - brand tone
   - spacing density
   - card/table/form behavior
   - token palette
   - typography
4. Bake in concrete UX guidance:
   - empty states
   - loading states
   - validation behavior
   - destructive action safeguards
   - mobile adaptation
5. Produce one strong prompt with explicit constraints and expected screens/components.

## Output Template
Use this structure:

```markdown
Title: <prototype goal>

Build a Lovable prototype for <scope>.

Product context:
- ...

Primary users:
- ...

Required screens:
- ...

Core flows:
- ...

Design direction:
- ...

Design tokens:
- color roles
- typography
- spacing
- radius
- elevation
- status colors

UX requirements:
- ...

Constraints:
- ...

Out of scope:
- ...
```

## Token Guidance
Prefer token roles, not random raw colors:
- `bg.canvas`
- `bg.surface`
- `bg.subtle`
- `text.primary`
- `text.secondary`
- `border.default`
- `brand.primary`
- `brand.secondary`
- `status.success`
- `status.warning`
- `status.danger`
- `status.info`

## Project Defaults
Unless the user overrides them, assume:
- therapist-facing MVP first
- patient portal is future scope
- WhatsApp confirmations are simple
- signature happens in-app with canvas + PDF flow
- receipts are internal PDFs
- `DSM/CID` is manual input only

## Additional Reference
- For a more concrete prompt scaffold, see [reference.md](reference.md)
