# Tasks: Bootstrap Landing Login

**Input**: Design documents from `/specs/001-bootstrap-landing-login/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/public-pages.md, quickstart.md

**Tests**: Include lightweight unit/integration checks for login placeholder validation and SEO/indexation because these are the highest-risk behaviors in this slice.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js modular monolith**: `apps/web/app/`, `apps/web/components/`, `apps/web/lib/`, `apps/web/public/`, `apps/web/tests/`
- **Reference prototype only**: `references/clinica-full/` is not production source

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap the production Next.js app structure and shared tooling.

- [X] T001 Create production Next.js project configuration in `apps/web/package.json`
- [X] T002 Create TypeScript configuration in `apps/web/tsconfig.json`
- [X] T003 Create Next.js configuration in `apps/web/next.config.ts`
- [X] T004 Create lint configuration in `apps/web/eslint.config.mjs`
- [X] T005 Create PostCSS/Tailwind configuration in `apps/web/postcss.config.mjs`
- [X] T006 Create shadcn registry configuration in `apps/web/components.json`
- [X] T007 Create root application layout in `apps/web/app/layout.tsx`
- [X] T008 Create global stylesheet with Lovable-derived design tokens in `apps/web/app/globals.css`
- [X] T009 Create shared utility helper in `apps/web/lib/utils.ts`
- [X] T010 [P] Create shadcn-style button component in `apps/web/components/ui/button.tsx`
- [X] T011 [P] Create shadcn-style card component in `apps/web/components/ui/card.tsx`
- [X] T012 [P] Create shadcn-style input component in `apps/web/components/ui/input.tsx`
- [X] T013 [P] Create shadcn-style label component in `apps/web/components/ui/label.tsx`
- [X] T014 [P] Create shadcn-style checkbox component in `apps/web/components/ui/checkbox.tsx`
- [X] T015 [P] Create shadcn-style alert component in `apps/web/components/ui/alert.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared content, SEO, validation, and route scaffolding required by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T016 Create public route group directory with placeholder route file in `apps/web/app/(public)/page.tsx`
- [X] T017 Create login route directory with placeholder route file in `apps/web/app/(public)/login/page.tsx`
- [X] T018 Create SEO metadata constants for landing and login in `apps/web/lib/seo/metadata.ts`
- [X] T019 Create public indexation rules in `apps/web/app/robots.ts`
- [X] T020 Create sitemap containing only landing and login entries in `apps/web/app/sitemap.ts`
- [X] T021 Create auth validation schemas/resolvers in `apps/web/src/utils/validators/login.ts` and `apps/web/src/utils/validators/register.ts`
- [X] T022 Create shared route constants for public/placeholder routes in `apps/web/lib/seo/public-routes.ts`
- [X] T023 Create marketing content model constants in `apps/web/lib/seo/landing-content.ts`
- [X] T024 Create placeholder legal routes shell in `apps/web/app/(public)/termos/page.tsx`
- [X] T025 Create placeholder privacy route shell in `apps/web/app/(public)/privacidade/page.tsx`
- [X] T026 Create placeholder account route shell in `apps/web/app/(public)/criar-conta/page.tsx`
- [X] T027 Create placeholder password recovery route shell in `apps/web/app/(public)/recuperar-senha/page.tsx`

**Checkpoint**: App routes, SEO helpers, validation schema, and placeholder pages exist.

---

## Phase 3: User Story 1 - Discover clinica-full from Search (Priority: P1) MVP

**Goal**: A search visitor can find and understand the public clinica-full landing page.

**Independent Test**: Open `/` and confirm the page explains the audience, modules, trust signal, and primary CTA to `/login`.

### Tests for User Story 1

- [X] T028 [P] [US1] Add SEO/indexation integration checks for landing and sitemap in `apps/web/tests/integration/seo-public-pages.test.ts`
- [X] T029 [P] [US1] Add content keyword validation for landing metadata/content in `apps/web/tests/unit/landing-content.test.ts`

### Implementation for User Story 1

- [X] T030 [P] [US1] Build landing page component structure in `apps/web/components/marketing/landing-page.tsx`
- [X] T031 [P] [US1] Build landing hero section with primary CTA to `/login` in `apps/web/components/marketing/landing-hero.tsx`
- [X] T032 [P] [US1] Build landing feature sections for patients, agenda, clinical records, finance, documents, and reminders in `apps/web/components/marketing/landing-features.tsx`
- [X] T033 [P] [US1] Build landing trust section for privacy, LGPD, secure access, and clinical organization in `apps/web/components/marketing/landing-trust.tsx`
- [X] T034 [US1] Compose the public landing route using marketing components in `apps/web/app/(public)/page.tsx`
- [X] T035 [US1] Add landing page metadata using `apps/web/lib/seo/metadata.ts` in `apps/web/app/(public)/page.tsx`
- [X] T036 [US1] Verify sitemap includes `/` and `/login` only via `apps/web/app/sitemap.ts`
- [X] T037 [US1] Verify robots/indexation rules exclude placeholders via `apps/web/app/robots.ts`

**Checkpoint**: Landing page is crawlable, communicates value in Portuguese, and routes its primary CTA to login.

---

## Phase 4: User Story 2 - Access the Login Page (Priority: P2)

**Goal**: A professional can open the login page, complete field validation, and see that auth is not connected yet.

**Independent Test**: Open `/login`, validate empty/invalid fields, submit valid-looking fields, and confirm no dashboard redirect occurs.

### Tests for User Story 2

- [X] T038 [P] [US2] Add placeholder login validation tests in `apps/web/tests/unit/login-placeholder.test.ts`
- [X] T039 [P] [US2] Add login page behavior checks for non-auth redirect behavior in `apps/web/tests/integration/login-placeholder-page.test.ts`

### Implementation for User Story 2

- [X] T040 [P] [US2] Build login card shell matching Lovable auth card direction in `apps/web/components/marketing/login-card.tsx`
- [X] T041 [P] [US2] Build password visibility control with accessible label in `apps/web/components/marketing/password-field.tsx`
- [X] T042 [US2] Implement client-only login placeholder form behavior in `apps/web/components/marketing/login-card.tsx`
- [X] T043 [US2] Connect validation resolver from `apps/web/src/utils/validators/login.ts` to `apps/web/src/components/marketing/login-card.tsx`
- [X] T044 [US2] Render login page route with metadata in `apps/web/app/(public)/login/page.tsx`
- [X] T045 [US2] Add create-account and forgot-password placeholder links in `apps/web/components/marketing/login-card.tsx`
- [X] T046 [US2] Ensure valid login submit shows "authentication not connected yet" message in `apps/web/components/marketing/login-card.tsx`

**Checkpoint**: Login page has required fields, accessible validation, placeholder submit behavior, and no fake session.

---

## Phase 5: User Story 3 - Build Trust Before Authentication (Priority: P3)

**Goal**: A cautious healthcare professional sees credible privacy, security, and legal entry points before logging in.

**Independent Test**: Review `/` and `/login` for privacy/LGPD/security messaging and terms/privacy access points.

### Implementation for User Story 3

- [X] T047 [P] [US3] Add legal link group component in `apps/web/components/marketing/legal-links.tsx`
- [X] T048 [P] [US3] Add placeholder Terms page content in `apps/web/app/(public)/termos/page.tsx`
- [X] T049 [P] [US3] Add placeholder Privacy page content in `apps/web/app/(public)/privacidade/page.tsx`
- [X] T050 [P] [US3] Add placeholder Create Account page content in `apps/web/app/(public)/criar-conta/page.tsx`
- [X] T051 [P] [US3] Add placeholder Password Recovery page content in `apps/web/app/(public)/recuperar-senha/page.tsx`
- [X] T052 [US3] Wire legal links into landing and login pages in `apps/web/components/marketing/landing-page.tsx`
- [X] T053 [US3] Wire legal links into login page in `apps/web/components/marketing/login-card.tsx`
- [X] T054 [US3] Confirm placeholder routes are excluded from sitemap/indexing in `apps/web/app/sitemap.ts` and `apps/web/app/robots.ts`

**Checkpoint**: Trust and legal entry points exist without making placeholder pages search-indexable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality gates and prepare for implementation handoff.

- [X] T055 [P] Validate Lovable visual continuity against `references/images/WhatsApp Image 2026-04-24 at 16.05.42.jpeg`
- [X] T056 [P] Validate landing clinical design direction against `docs/lovable-prototype-prompt.md`
- [X] T057 Validate keyboard navigation for landing CTA and login form in `apps/web/app/(public)/page.tsx` and `apps/web/app/(public)/login/page.tsx`
- [X] T058 Validate mobile layout for no horizontal scrolling in `apps/web/app/(public)/page.tsx` and `apps/web/app/(public)/login/page.tsx`
- [X] T059 Validate SEO title, description, sitemap, and robots behavior against `specs/001-bootstrap-landing-login/quickstart.md`
- [X] T060 Validate placeholder login does not persist, transmit, or log credentials in `apps/web/components/marketing/login-card.tsx`
- [X] T061 Run lint/type/build checks and document actual commands in `specs/001-bootstrap-landing-login/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **US1 Landing (Phase 3)**: Depends on Foundational phase.
- **US2 Login (Phase 4)**: Depends on Foundational phase; can run in parallel with US1 after shared UI and validation exist.
- **US3 Trust (Phase 5)**: Depends on Foundational phase; integrates into US1/US2 components.
- **Polish (Phase 6)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent MVP after foundational setup.
- **US2 (P2)**: Independent after foundational setup; uses shared UI/validation.
- **US3 (P3)**: Enhances US1/US2 and placeholder routes; should land after or alongside those components.

### Within Each User Story

- Tests/checks before implementation where listed.
- Shared helpers before page composition.
- Components before route composition.
- Route composition before manual quickstart validation.

---

## Parallel Opportunities

- Setup UI component tasks T010-T015 can run in parallel.
- Foundational placeholder route tasks T024-T027 can run in parallel after route structure exists.
- US1 component tasks T030-T033 can run in parallel.
- US2 test tasks T038-T039 can run in parallel.
- US3 placeholder/legal page tasks T047-T051 can run in parallel.
- Polish validation tasks T055-T056 can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T030 [US1] Build landing page component structure in apps/web/components/marketing/landing-page.tsx"
Task: "T031 [US1] Build landing hero section with primary CTA to /login in apps/web/components/marketing/landing-hero.tsx"
Task: "T032 [US1] Build landing feature sections in apps/web/components/marketing/landing-features.tsx"
Task: "T033 [US1] Build landing trust section in apps/web/components/marketing/landing-trust.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T038 [US2] Add placeholder login validation tests in apps/web/tests/unit/login-placeholder.test.ts"
Task: "T039 [US2] Add login page behavior checks in apps/web/tests/integration/login-placeholder-page.test.ts"
Task: "T041 [US2] Build password visibility control in apps/web/components/marketing/password-field.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T047 [US3] Add legal link group component in apps/web/components/marketing/legal-links.tsx"
Task: "T048 [US3] Add placeholder Terms page content in apps/web/app/(public)/termos/page.tsx"
Task: "T049 [US3] Add placeholder Privacy page content in apps/web/app/(public)/privacidade/page.tsx"
Task: "T050 [US3] Add placeholder Create Account page content in apps/web/app/(public)/criar-conta/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: Landing page and search discovery.
4. Stop and validate landing page independently.

### Incremental Delivery

1. Setup + Foundation -> app shell, tokens, metadata helpers, routes.
2. US1 -> public landing and search baseline.
3. US2 -> login placeholder experience.
4. US3 -> trust/legal placeholders.
5. Polish -> accessibility, SEO, mobile, and non-auth validation.

### Suggested MVP Scope

The smallest useful increment is Phase 1 + Phase 2 + Phase 3. The complete feature
requires all phases through Phase 6.

---

## Notes

- Do not reuse `references/clinica-full` as production source; use it only for visual and UX reference.
- Do not implement real authentication in this slice.
- Do not include placeholder pages in the sitemap.
- Do not redirect valid login submissions to a dashboard.
- Do not persist, transmit, or log credential fields.

