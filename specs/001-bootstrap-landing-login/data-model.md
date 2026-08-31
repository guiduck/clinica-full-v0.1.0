# Data Model: Bootstrap Landing Login

This slice does not introduce persisted database entities. The models below are
view/content contracts used to structure UI, SEO, and placeholder interactions.

## LandingPageContent

Purpose: Public-facing content for the product landing page.

Fields:
- `heroTitle`: primary above-the-fold value proposition.
- `heroSubtitle`: short explanation for autonomous therapists, psychologists, and
  psychiatrists.
- `primaryCtaLabel`: text for the primary CTA; must lead to login.
- `primaryCtaHref`: login page route.
- `seoKeywordPhrases`: at least six Portuguese organic-search phrases.
- `featureSections`: list of product modules and benefits.
- `trustStatements`: privacy, LGPD, secure access, and clinical organization copy.
- `legalLinks`: links or placeholders for Terms of Use and Privacy Policy.

Validation rules:
- Must use Portuguese user-facing copy.
- Must clearly identify the target audience.
- Must mention core modules: patients, agenda, clinical records, finance,
  documents, and reminders.
- Must not imply real signup or authentication is active.

## LoginFormState

Purpose: Non-authenticating login UI state.

Fields:
- `email`: user-entered e-mail value.
- `password`: user-entered password value.
- `rememberMe`: boolean preference shown in UI only.
- `showPassword`: boolean controlling visibility.
- `validationErrors`: field-level validation messages.
- `placeholderMessage`: post-submit message explaining auth is not connected.

Validation rules:
- E-mail is required and must be shaped like an e-mail address.
- Password is required.
- Valid submit must not transmit, persist, or log credentials.
- Valid submit must not redirect to private pages.

State transitions:
- `idle` -> `invalid`: missing or malformed fields.
- `idle` -> `placeholderReady`: fields valid and placeholder message shown.
- `invalid` -> `placeholderReady`: fields corrected and placeholder submit shown.

## SeoMetadata

Purpose: Search and social-preview metadata for public pages.

Fields:
- `title`: concise page title.
- `description`: search-friendly description.
- `keywords`: relevant Portuguese phrases.
- `canonicalPath`: public page path.
- `openGraphTitle`: social-preview title.
- `openGraphDescription`: social-preview description.
- `indexable`: whether the page should be available to Google Search.

Validation rules:
- Landing and login pages are indexable.
- Placeholder pages are not indexable in this slice.
- Landing metadata must include the target audience and product category.

## SitemapEntry

Purpose: Search-discovery entry for allowed public pages.

Fields:
- `path`: public route path.
- `priority`: relative discovery priority.
- `changeFrequency`: expected update cadence.

Validation rules:
- Only landing and login routes are included in this slice.
- Placeholder routes for create account, password recovery, terms, or privacy are
  excluded unless a future spec changes their status.

## IndexationRule

Purpose: Robots/indexation policy for public and placeholder routes.

Fields:
- `routePattern`: route or route group.
- `allowIndexing`: boolean.
- `reason`: why the route is allowed or excluded.

Validation rules:
- Landing and login allow indexing.
- Placeholder routes deny indexing.
- Future authenticated or private routes deny indexing by default.

