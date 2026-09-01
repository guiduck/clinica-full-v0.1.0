# AGENTS.md

## Project Agent Instructions

This repository supports both Cursor and Codex agent workflows. Keep Cursor-specific
files in place, and use the repository-level Codex conventions in this file as an
additive compatibility layer.

## Spec Kit Context

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/003-prototype-front-reconstruction/plan.md`
<!-- SPECKIT END -->

For `/speckit.specify`, `/speckit.clarify`, and `/speckit.plan`, prefer consulting
the `specify-prompt-engineer` skill first whenever the user request is broad,
mixed with strategy context, or likely to create ambiguous artifacts.

When available, also use `docs/handoff.md` and `docs/roadmap.md` as current project
context.

The Lovable prototype and `docs/lovable-prototype-prompt.md` are the default
product/UX source of truth. When behavior, labels, navigation, or screen flow are
ambiguous, follow the prototype unless a spec, ADR, or plan explicitly overrides it
for security, LGPD, accessibility, production architecture, or narrowed slice scope.

## Development Completion Rules

After finishing any development implementation, always update the project
documentation so the next agent or model can understand the current state without
chat history. At minimum, review and update:

- `docs/roadmap.md` with the current phase/status and what moved forward.
- `docs/project-overview.md` with meaningful product or architecture changes.
- `docs/handoff.md` with what changed, validation results, current status,
  remaining blockers, and the recommended next step.

After implementation, also prepare the next Spec Kit specification prompt as a
Markdown brief for the next roadmap item. Use the `specify-prompt-engineer` skill
for this prompt-engineering pass, and base the brief on the current roadmap,
`docs/`, `docs/handoff.md`, and the existing Lovable prototype/reference material
under `references/`. The brief should be ready to feed into `/speckit.specify`.

## Production App Architecture

This project is not a throwaway prototype. The Lovable prototype and files under
`references/` are UI/flow references only; production code must implement real,
server-first behavior whenever feasible.

The web app lives in `apps/web` and should follow this structure:

- `src/app/(public)` for public pages.
- `src/app/(private)` for authenticated pages.
- `src/middleware.ts` for route protection and auth redirects.
- `src/actions` for server actions that mutate state, set cookies, redirect, or
  call services.
- `src/services` for domain/API service functions.
- `src/lib/api` for the typed server-side fetch wrapper used to call Next route
  handlers or external APIs.
- `src/lib/errors` for structured API/domain error helpers.
- `src/types` for reusable project DTOs and domain types.
- `prisma/schema.prisma` for database schema, with PostgreSQL as the default DB.

Prefer React Server Components, server actions, route handlers, Prisma, and native
Next.js cache APIs (`revalidateTag`, `revalidatePath`, `next: { tags }`) before
introducing client-side fetching. Use client components only for interactive UI
state such as forms, password visibility, optimistic feedback, or browser-only
controls. Do not use placeholder flows when a functional server-side slice can be
implemented safely.

## Frontend Code Organization

Treat the Lovable prototype as the visual and functional baseline, not as a code
organization template. Production frontend work must follow these conventions:

- Keep page files focused on composition, route data, and orchestration.
- Extract domain components with clear responsibilities instead of growing
  monolithic page components.
- Use dedicated hooks for complex or reusable interactive state. Do not create hooks
  merely to hide trivial expressions.
- Move option lists, labels, fixed metadata, and flow configuration out of page JSX
  into domain-local `constants.ts` files.
- Keep reusable formatters, Zod validators, and input masks in separate folders.
- Implement deterministic formatters, masks, normalizers, and calculations as pure,
  immutable functions. Keep side effects in actions, services, adapters, or
  integration hooks.
- Use Zod schemas as the shared validation source for client and server, deriving
  input types and resolvers from those schemas.
- Apply real Brazilian validation and formatting from the first implementation:
  CPF check digits, CNPJ when applicable, 10/11-digit phones, 8-digit CEP, BRL,
  24-hour time, and user-visible dates in `dd/mm/yyyy`, never `mm/dd/yyyy`.
- Do not copy the prototype's monolithic store, mock persistence, localStorage data
  model, page-local constants, or scattered utilities.
- When the prototype shows an interaction whose production service does not exist,
  preserve the UI but show an explicit unavailable/not-implemented message. Never
  simulate a successful mutation or fake persisted data.

### Component Architecture Standard

- New or substantially refactored components live in
  `src/components/<componentNameCamelCase>/`. Use kebab-case filenames for their
  parts and reserve `index.tsx` for the explicit, ready-to-use public API.
- Colocate subcomponents, unit tests, and stories with their owner. Use names such
  as `component-part.tsx`, `component-part.test.tsx`, and
  `component-part.stories.tsx`.
- Prefer composition and compound components for complex UI. Expose explicit parts
  such as `Component.Root`, `Component.Trigger`, and `Component.Content`, plus an
  ergonomic assembled component when a common usage deserves one.
- Keep broad domain barrels out of runtime paths. An `index.tsx` may explicitly
  export the small public API of one component; do not use `export *` aggregators.
- Put reusable domain types in `src/types`, fixed metadata and option maps in
  `src/constants`, pure deterministic functions in `src/utils`, client UI state in
  `src/stores`, and non-trivial synchronization in dedicated hooks.
- Zustand stores are for cross-component client UI state. Server state and domain
  mutations remain in Server Components, Server Actions, services, and adapters.
  Providers hide the store implementation from composed UI whenever practical.
- Prefer early returns and named booleans. Nested ternaries are forbidden. For
  conditional JSX, prefer a named condition with `&&` or a subcomponent that
  returns early instead of `condition ? <Node /> : null`.
- Effects must synchronize with an external system (DOM, URL, browser API, network,
  or subscription). Put interaction-driven work in event handlers and isolate
  unavoidable effects in focused custom hooks.

## Codex Skill Mapping

Codex discovers repository skills from `.agents/skills`. The Spec Kit and project
workflow skills mirrored there are the Codex-compatible equivalents of the Cursor
skills under `.cursor/skills`.

When a user invokes a Cursor-style command in Codex, map it to the matching skill:

- `/speckit.specify` or `/speckit-specify` -> `speckit-specify`
- `/speckit.clarify` or `/speckit-clarify` -> `speckit-clarify`
- `/speckit.plan` or `/speckit-plan` -> `speckit-plan`
- `/speckit.tasks` or `/speckit-tasks` -> `speckit-tasks`
- `/speckit.implement` or `/speckit-implement` -> `speckit-implement`
- `/speckit.analyze` or `/speckit-analyze` -> `speckit-analyze`
- `/speckit.checklist` or `/speckit-checklist` -> `speckit-checklist`
- `/speckit.constitution` or `/speckit-constitution` -> `speckit-constitution`
- `/speckit.taskstoissues` or `/speckit-taskstoissues` -> `speckit-taskstoissues`
- `/speckit.git.commit` or `/speckit-git-commit` -> `speckit-git-commit`
- `/speckit.git.feature` or `/speckit-git-feature` -> `speckit-git-feature`
- `/speckit.git.initialize` or `/speckit-git-initialize` -> `speckit-git-initialize`
- `/speckit.git.remote` or `/speckit-git-remote` -> `speckit-git-remote`
- `/speckit.git.validate` or `/speckit-git-validate` -> `speckit-git-validate`

For Lovable prototype prompt work, use `lovable-prompt-engineer`.

## Compatibility Rules

- Do not remove or rename `.cursor/rules` or `.cursor/skills`; Cursor still uses
  them.
- Do not remove or rename `.agents/skills`; Codex uses this directory for repo
  skills.
- If a Spec Kit workflow updates the active plan reference, keep both
  `.cursor/rules/specify-rules.mdc` and this `AGENTS.md` in sync between the
  `SPECKIT START` and `SPECKIT END` markers.
- Prefer `.specify/feature.json` and the `.specify/scripts` helpers to locate the
  active feature instead of inferring only from the git branch name.
- Preserve the project constitution at `.specify/memory/constitution.md` as the
  authority for Spec Kit quality gates.

