# Research: Bootstrap Landing Login

## Decision: Use Next.js App Router as the production bootstrap

Rationale: The project constitution and ADR require a production-ready Next.js
modular monolith. The Lovable export under `references/clinica-full` uses
TanStack/Vite and is valuable as UX/design reference, but it is not the production
architecture target.

Alternatives considered:
- Reuse the Lovable TanStack/Vite app directly: rejected because it conflicts with
  the accepted Next.js architecture and would require later migration.
- Build a separate marketing site: rejected because the project should remain a
  simple modular monolith at this stage.

## Decision: Keep landing and login mostly server-rendered

Rationale: The landing page must be crawlable and fast. Server-rendered public
content provides better baseline SEO and simpler performance behavior. The login
page only needs client behavior for password visibility, field validation feedback,
and placeholder submit messaging.

Alternatives considered:
- Fully client-rendered landing: rejected because it weakens crawlability and adds
  unnecessary JavaScript.
- API-backed login in this slice: rejected because the clarified scope explicitly
  defers real authentication.

## Decision: Implement complete initial SEO with narrow indexation

Rationale: The feature requires Google discovery while restricting indexation to
the public landing page and login page. Metadata, social-preview content, sitemap,
and robots/indexation rules create a clear baseline for search engines and future
Search Console validation.

Alternatives considered:
- Metadata only: rejected because it does not define sitemap or indexation boundary.
- Index all placeholder pages: rejected because placeholders should not appear in
  Google Search for this slice.
- Add advanced structured data now: deferred because the user asked for complete
  initial SEO with sitemap, but not schema markup; it can be added later if useful.

## Decision: Placeholder auth must validate fields without transmitting credentials

Rationale: The user wants real authentication later, but not in this first spec.
The safest placeholder behavior is to validate required fields locally and show a
clear message that authentication is not connected yet. This avoids fake sessions,
private placeholders, and accidental credential logging.

Alternatives considered:
- Accept any login and redirect to a placeholder dashboard: rejected because it
  implies a successful authenticated session.
- Disable submit entirely: rejected because it prevents testing validation and form
  interaction.
- Send data to a stub route: rejected because there is no need to transmit
  credential fields in this slice.

## Decision: Use Lovable design tokens as the first UI theme baseline

Rationale: The constitution says the Lovable prototype is the visual and functional
guide. The reference CSS already defines calm clinical colors, typography, spacing,
radius, and status colors. Mapping those to shadcn/Tailwind tokens preserves visual
continuity while enabling production components.

Alternatives considered:
- Invent a new visual system: rejected because it would drift from the validated
  prototype.
- Copy all Lovable code wholesale: rejected because the production app is Next.js,
  and only the visual/design behavior should be carried forward.

## Decision: Use risk-based validation instead of full e2e auth testing

Rationale: This slice has no real authentication or persistence. The meaningful
risks are SEO/indexation, accessibility, responsive behavior, and avoiding false
auth/session behavior. Tests and manual checks should focus there.

Alternatives considered:
- Full authentication integration tests: deferred until real auth is specified.
- No tests/checks: rejected because the constitution requires quality gates for
  public UX, accessibility, and performance-sensitive pages.

