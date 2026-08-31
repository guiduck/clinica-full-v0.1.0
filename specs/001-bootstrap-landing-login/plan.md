# Implementation Plan: Bootstrap Landing Login

**Branch**: `001-bootstrap-landing-login` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-bootstrap-landing-login/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Bootstrap the production Next.js application with a public, Google-indexable landing
page and a simple login page using the Lovable visual direction and shadcn-style UI.
Only the landing page and login page are intended for Google Search in this slice.
Login, account creation, and password recovery remain placeholder flows: fields are
validated, but no real authentication is performed and no credentials are persisted
or transmitted.

## Technical Context

**Language/Version**: TypeScript + Next.js 15+ App Router  
**Primary Dependencies**: shadcn/ui, Tailwind CSS, react-hook-form, zod, lucide-react, next/font  
**Storage**: None for this slice; no credentials, clinical data, or form submissions are persisted  
**Testing**: Type checking, linting, accessibility/manual keyboard review, SEO metadata/sitemap review  
**Target Platform**: Web app on Vercel-compatible runtime
**Project Type**: Next.js modular monolith  
**Performance Goals**: Public pages load fast on mobile, avoid heavy client JavaScript, and expose crawlable content without authentication  
**Constraints**: Lovable-guided UI, shadcn components, Portuguese copy, SEO indexation limited to landing/login, no real auth in this slice, accessibility, mobile responsiveness  
**Scale/Scope**: Initial public bootstrap only: landing page, login page, SEO metadata, robots/indexation rules, sitemap, placeholder auth actions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Lovable fidelity**: PASS. Login and account-entry patterns reference
  `references/images/WhatsApp Image 2026-04-24 at 16.05.42.jpeg`,
  `references/images/WhatsApp Image 2026-04-24 at 16.05.42 (1).jpeg`,
  and `docs/lovable-prototype-prompt.md`. Landing has no prototype screen, so it
  follows the same calm clinical design tokens and Portuguese copy.
- **Security/LGPD**: PASS. No real credentials are submitted, persisted, or
  transmitted. Terms/privacy links are present as entry points, and placeholder
  actions communicate that services are not connected.
- **Next.js performance**: PASS. Landing should be primarily server-rendered and
  crawlable. Login should isolate only password visibility and placeholder submit
  behavior as client interaction. SEO metadata, sitemap, and robots rules are
  explicit deliverables.
- **shadcn/accessibility**: PASS. Use shadcn-style cards, buttons, inputs, labels,
  alerts, and accessible focus/keyboard behavior. Icon controls require labels.
- **Vertical slice quality**: PASS. The slice is independently demoable: public
  landing -> login -> validated placeholder submit. Validation includes lint/type
  checks, keyboard review, mobile review, and SEO/indexation review.

## Project Structure

### Documentation (this feature)

```text
specs/001-bootstrap-landing-login/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (`apps/web`)

```text
apps/web/
├── app/
├── (public)/
│   ├── page.tsx                  # Landing page
│   └── login/
│       └── page.tsx              # Login placeholder page
├── layout.tsx                    # Root metadata, font, global shell
├── robots.ts                     # Indexation rules for landing/login only
└── sitemap.ts                    # Sitemap with landing/login only

├── components/
├── ui/
└── marketing/
    ├── landing-page.tsx
    └── login-card.tsx

├── lib/
├── seo/
│   └── metadata.ts
└── validations/
    └── login-placeholder.ts

├── public/
└── brand-assets/                 # Optional static brand assets for public pages

└── tests/
├── unit/
│   └── login-placeholder.test.ts
├── integration/
│   └── seo-public-pages.test.ts
└── e2e/
```

**Structure Decision**: Use a fresh Next.js App Router modular monolith in the
`apps/web`. The existing Lovable/TanStack code under `references/clinica-full`
is reference material only and must not dictate production routing or architecture.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0 Research Summary

See [research.md](./research.md). All technical unknowns for this slice are resolved:
Next.js App Router bootstrap, SEO/indexation boundaries, placeholder auth behavior,
Lovable token mapping, and accessibility/performance validation.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/public-pages.md](./contracts/public-pages.md),
and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Lovable fidelity**: PASS. Design retains the authentication card pattern and
  clinical visual identity while adding a new landing page consistent with tokens.
- **Security/LGPD**: PASS. No real auth is implemented; placeholder actions avoid
  credential persistence/transmission and include privacy/terms entry points.
- **Next.js performance**: PASS. Server-rendered public content and metadata are
  planned; client interaction is isolated to login form controls.
- **shadcn/accessibility**: PASS. Component and validation contracts include labels,
  focus states, keyboard completion, and non-icon-only controls.
- **Vertical slice quality**: PASS. Quickstart defines independent validation for
  landing, login, SEO, sitemap, robots, mobile, and placeholder auth behavior.
