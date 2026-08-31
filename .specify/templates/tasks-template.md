---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Risk-based tests are required for authentication, authorization, clinical
records, finance, documents, signatures, webhooks, migrations, and other sensitive
paths. For lower-risk UI-only work, include at least the validation steps required
by the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js modular monolith**: `app/`, `components/`, `lib/`, `prisma/`, `tests/`
- **Single project**: `src/`, `tests/` at repository root
- **Split web app**: `backend/src/`, `frontend/src/` only if an ADR approves split services
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create/update Next.js structure per implementation plan
- [ ] T002 Install/configure feature dependencies approved in plan
- [ ] T003 [P] Configure linting, formatting, type checking, and test scripts
- [ ] T004 [P] Confirm shadcn/ui component usage and design token alignment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 Setup Prisma schema and migration plan
- [ ] T006 [P] Implement authentication and authorization guardrails
- [ ] T007 [P] Setup Server Actions/Route Handlers with validation boundaries
- [ ] T008 Create shared domain models/entities required by all stories
- [ ] T009 Configure error handling, audit logging, and safe log redaction
- [ ] T010 Setup environment configuration and secret validation
- [ ] T011 Define Server/Client Component boundaries and data loading strategy
- [ ] T012 Define accessibility baseline for dialogs, forms, focus, and labels

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (risk-based; required for sensitive paths) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Unit/contract test for [validation/service/action] in tests/unit/[name].test.ts
- [ ] T014 [P] [US1] Integration/e2e test for [user journey] in tests/integration/[name].test.ts

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create/update Prisma/domain model for [Entity1] in prisma/schema.prisma and lib/[feature]/
- [ ] T016 [P] [US1] Build shadcn-based UI matching Lovable reference in components/[feature]/
- [ ] T017 [US1] Implement server-side data loading/mutation in app/ or lib/[feature]/ (depends on T015)
- [ ] T018 [US1] Add zod validation, typed errors, and user-facing form feedback
- [ ] T019 [US1] Add authorization, audit logging, and safe error handling
- [ ] T020 [US1] Verify accessibility, responsive behavior, and prototype fidelity

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (risk-based; required for sensitive paths) ⚠️

- [ ] T021 [P] [US2] Unit/contract test for [validation/service/action] in tests/unit/[name].test.ts
- [ ] T022 [P] [US2] Integration/e2e test for [user journey] in tests/integration/[name].test.ts

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create/update Prisma/domain model for [Entity] in prisma/schema.prisma and lib/[feature]/
- [ ] T024 [US2] Implement server-side feature logic in app/ or lib/[feature]/
- [ ] T025 [US2] Build shadcn-based UI in components/[feature]/
- [ ] T026 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (risk-based; required for sensitive paths) ⚠️

- [ ] T027 [P] [US3] Unit/contract test for [validation/service/action] in tests/unit/[name].test.ts
- [ ] T028 [P] [US3] Integration/e2e test for [user journey] in tests/integration/[name].test.ts

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create/update Prisma/domain model for [Entity] in prisma/schema.prisma and lib/[feature]/
- [ ] T030 [US3] Implement server-side feature logic in app/ or lib/[feature]/
- [ ] T031 [US3] Build shadcn-based UI in components/[feature]/

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Validate Lovable prototype fidelity across implemented screens
- [ ] TXXX Accessibility review for labels, focus, keyboard dialogs, and icon actions
- [ ] TXXX Performance review for data fetching, bundle size, and heavy client components
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security/LGPD hardening and audit log review
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
