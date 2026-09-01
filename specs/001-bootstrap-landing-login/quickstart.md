# Quickstart: Bootstrap Landing Login

## Goal

Validate the first production-ready Next.js slice:

- public landing page;
- login page with placeholder authentication behavior;
- SEO metadata;
- sitemap containing only landing and login;
- robots/indexation rules excluding placeholder routes;
- Lovable/shadcn visual continuity;
- accessibility and mobile usability.

## Prerequisites

- Project dependencies installed after the Next.js bootstrap is created.
- Feature branch: `001-bootstrap-landing-login`.
- Active spec: `specs/001-bootstrap-landing-login/spec.md`.
- Web app package: `apps/web`.

## Expected Routes

- `/` - public landing page, indexable.
- `/login` - login page, indexable.
- `/criar-conta` - functional account creation, not included in sitemap.
- `/dashboard` - authenticated private dashboard.
- `/recuperar-senha` - placeholder, not included in sitemap.
- `/termos` - placeholder or legal entry point, not included in sitemap for this slice.
- `/privacidade` - placeholder or legal entry point, not included in sitemap for this slice.

## Manual Validation

1. Open `/`.
2. Confirm the page explains clinica-full for autonomous therapists,
   psychologists, and psychiatrists.
3. Confirm the page mentions patients, agenda, clinical records, finance,
   documents, and reminders.
4. Confirm the primary CTA leads to `/login`.
5. Confirm trust messaging references privacy, LGPD awareness, secure access, and
   professional clinical organization.
6. Open `/login`.
7. Confirm e-mail, password, show/hide password, remember-me, forgot-password,
   create-account, and primary login action are visible.
8. Submit empty fields and confirm accessible validation messages appear.
9. Create an account at `/criar-conta`, then confirm the app redirects to `/dashboard`.
10. Logout, login again with the created credentials, and confirm `/dashboard` loads.
11. Navigate with keyboard only through landing CTA and login form.
12. Review mobile layout and confirm no horizontal scrolling or hidden primary
   actions.

## SEO Validation

1. Confirm the landing page has meaningful title and description.
2. Confirm the login page has meaningful title and description.
3. Confirm at least six relevant organic-search phrases appear naturally in landing
   content or metadata.
4. Confirm sitemap includes only `/` and `/login`.
5. Confirm robots/indexation rules do not expose placeholder routes for Google
   Search.
6. Confirm social-preview metadata is meaningful for the landing page.

## Quality Checks

Run the available project checks once the Next.js app is bootstrapped:

```bash
cd apps/web
npm run test
npm run lint
npm run typecheck
npm run build
```

Actual validation commands used for this implementation:

```bash
cd apps/web
npm run db:generate
npx prisma validate
npm run test
npm run lint
npm run typecheck
npm run build
```

Local database setup:

```bash
cd apps/web
docker compose up -d postgres
npm run db:push
```

On this Windows sandbox, `npm.cmd` was used instead of `npm` because PowerShell
blocks `npm.ps1` execution by policy. Vitest and Next build also required
permission to spawn local worker processes.

If the page renders as unstyled HTML after moving the app or interrupting a server,
stop the local Next process, remove `apps/web/.next`, run `npm run build` again
from `apps/web`, and restart the preview. The CSS asset should be available under
`/_next/static/css/*.css`.

## Acceptance Summary

The slice is complete when:

- landing and login match the functional contract;
- only landing and login are search-indexable;
- login and account creation are functional with server-side auth;
- credentials are never logged and passwords are stored only as hashes;
- sessions use a database-backed HttpOnly cookie;
- Lovable visual direction is recognizable;
- shadcn-style components are used;
- keyboard and mobile reviews pass.

