# Frontend component architecture

## Status

This document is the production frontend standard. The first complete migration
applies it to `AppShell`, `OnboardingTour`, and `Tooltip`, the subsystem that had
the highest concentration of duplicated state, global events, DOM effects, and
mixed rendering logic.

## Directory contract

```text
src/
├── components/
│   └── componentNameCamelCase/
│       ├── index.tsx
│       ├── component-part.tsx
│       ├── component-part.test.tsx
│       └── component-part.stories.tsx
├── constants/
├── hooks/
├── stores/
├── types/
└── utils/
```

`index.tsx` assembles and explicitly exports one component's public API. It is not
a broad barrel. Internal parts stay in kebab-case files in the same component
folder. Domain categories may still group route-level components while they await
migration, but new complex components must use the per-component folder contract.

## Composition contract

Complex UI is composed from small, semantic parts. A compound API may expose:

```tsx
<Tooltip content="Abrir menu" side="right">
  <button type="button">Menu</button>
</Tooltip>

<Tooltip.Root>
  <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
  <Tooltip.Content>Conteúdo customizado</Tooltip.Content>
</Tooltip.Root>
```

The assembled API covers the common case. Compound parts cover customization
without multiplying boolean props or render callbacks.

## State boundaries

- React local state: state owned by one leaf component.
- Context: a stable state/actions/meta contract shared by compound parts.
- Zustand: cross-component, browser-only UI state such as the tour and shell menus.
- Server Components and services: authoritative server data.
- Server Actions: authenticated mutations and persistence.

Zustand must not become a second database cache or contain clinical/financial
domain persistence. Store actions are synchronous UI transitions. Hooks coordinate
the store with URL/history, server preferences, DOM observers, and navigation.

Browser globals (`window`, `document`, observers and viewport dimensions) are never
read during render, including in Client Components, because they are still
pre-rendered by Next.js. Focused hooks read them after mount and publish only the
minimal serializable UI state needed by the component tree.

## Conditional and effect rules

- Use early returns for invalid, absent, loading, or unsupported states.
- Give complex conditions a descriptive name before JSX.
- Never use nested ternaries.
- Prefer `condition && <Part />` for a named display condition.
- If conditional markup grows, extract a subcomponent and return `null` early.
- Effects are only for external synchronization. User interactions execute in
  handlers. DOM measurement belongs in a focused hook and must be event/observer
  driven, not an unconditional animation-frame loop.
- Landmark elements are reserved for page structure. Internal dialog sections use
  headings and neutral containers so they do not create duplicate `banner`, `main`
  or navigation landmarks.

## Current migration inventory

Completed:

- `components/appShell`: composed header, menus, navigation rail/sheet/bottom bar.
- `components/onboardingTour`: Provider, Zustand store, controller hooks, pure
  geometry/query utilities, overlay, spotlight, card, progress, hints, and actions.
- `components/tooltip`: ergonomic wrapper plus `Root`, `Trigger`, `Content`, and
  `Provider` compound API.

Next decomposition candidates, ordered by size and coupling:

1. `dashboard/dashboard-view.tsx` — 220 lines.
2. `appointments/agenda-calendar.tsx` — 166 lines.
3. `patients/patient-wizard.tsx` — 162 lines.
4. `patients/patient-clinical-tabs.tsx` — 155 lines.
5. `finance/finance-dashboard.tsx` — 139 lines.
6. `patients/patient-financial-profile-form.tsx` — 135 lines.
7. `marketing/login-card.tsx` and `register-card.tsx` — 128/121 lines.
8. `patients/patient-profile-view.tsx` — 124 lines.

These components remain functional and are not to be mechanically moved without
splitting responsibilities. Each must migrate when its next product slice touches
it, with tests retained or added before the old entry point is removed.

## Enforcement and validation

- ESLint rejects nested ternaries globally.
- Migrated component folders also reject `condition ? JSX : null`.
- `frontend-architecture.test.ts` protects the new public entry points, removed
  legacy paths and the absence of a global `CustomEvent` bus.
- Tour geometry, query parsing and store transitions have focused unit tests.
- AppShell/tour composition has component coverage and the full Playwright journey
  runs in desktop and mobile viewports.
