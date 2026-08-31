# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript + Next.js [version or NEEDS CLARIFICATION]  
**Primary Dependencies**: shadcn/ui, react-hook-form, zod, Prisma, Auth.js/NextAuth, [feature-specific dependencies]  
**Storage**: PostgreSQL via Prisma; managed document storage if files are involved  
**Testing**: [unit/integration/e2e tools or NEEDS CLARIFICATION]  
**Target Platform**: Web app on Vercel-compatible runtime
**Project Type**: Next.js modular monolith  
**Performance Goals**: [feature-specific goals; include dashboard/list/agenda load expectations]  
**Constraints**: Lovable-guided UI, shadcn components, LGPD/security, accessibility, mobile responsiveness  
**Scale/Scope**: Single-professional MVP unless this feature explicitly has an approved ADR

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Lovable fidelity**: Reference the relevant `references/images` screens and
  `docs/lovable-prototype-prompt.md` section, or document why no prototype screen
  applies.
- **Security/LGPD**: Identify sensitive data touched, auth/authorization checks,
  consent/audit/logging needs, and any encryption decision.
- **Next.js performance**: Define Server/Client Component boundaries, data fetching
  strategy, waterfall avoidance, and dynamic loading for heavy modules.
- **shadcn/accessibility**: Confirm shadcn-style components, labels, keyboard/focus
  behavior, responsive layout, and tooltip/text for icon actions.
- **Vertical slice quality**: Define independent demo path, risk-based tests,
  lint/type/test commands, and accepted gaps.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Next.js modular monolith
app/
├── (auth)/
├── (app)/
├── api/
└── layout.tsx

components/
├── ui/
└── [feature]/

lib/
├── auth/
├── db/
├── validations/
└── [feature]/

prisma/
└── schema.prisma

tests/
├── unit/
├── integration/
└── e2e/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
