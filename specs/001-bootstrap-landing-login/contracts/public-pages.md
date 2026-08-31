# UI Contract: Public Landing and Login

This feature exposes user-facing pages rather than external APIs. These contracts
define the observable page behavior that implementation and tests must satisfy.

## Landing Page Contract

Route:
- `/`

Audience:
- Unauthenticated visitors.

Indexation:
- Must be available to Google Search.
- Must be included in the sitemap.
- Must provide meaningful title, description, and social-preview metadata.

Required visible content:
- Clinica Agil brand.
- Clear target audience: therapists, psychologists, and psychiatrists working
  independently.
- Core value proposition: patients, agenda, clinical records, finance, documents,
  and reminders in one place.
- At least six organic-search keyword phrases naturally represented in content or
  metadata.
- Trust statements for privacy, LGPD awareness, secure access, and professional
  clinical organization.
- Primary CTA that links to `/login`.
- Entry points for Terms of Use and Privacy Policy as placeholders or links.

Required states:
- Desktop layout with generous whitespace and clinical visual identity.
- Mobile layout with no horizontal scrolling and touch-friendly CTA.

Forbidden behavior:
- No mock-data generator buttons.
- No prototype-hosting banner.
- No claim that real signup/authentication is active.

## Login Page Contract

Route:
- `/login`

Audience:
- Professionals attempting to access the app.

Indexation:
- Must be available to Google Search.
- Must be included in the sitemap.
- Must provide meaningful title, description, and social-preview metadata.

Required visible content:
- Clinica Agil brand.
- E-mail field.
- Password field.
- Show/hide password control with accessible label.
- Remember-me option.
- Forgot-password entry point.
- Create-account entry point.
- Primary login action.
- Terms/Privacy entry points or accessible nearby links.

Placeholder submit behavior:
- Empty or malformed fields show accessible validation feedback.
- Valid fields show a message that authentication is not connected yet.
- Valid submit must not redirect to dashboard or private pages.
- Valid submit must not persist, transmit, or log credentials.

Required states:
- Initial idle state.
- Field validation error state.
- Placeholder success/information state.
- Mobile layout with keyboard-accessible form controls.

Forbidden behavior:
- No real authentication.
- No fake authenticated session.
- No redirection to private dashboard.
- No credential persistence.

## Placeholder Route Indexation Contract

Routes:
- `/criar-conta`
- `/recuperar-senha`
- `/termos`
- `/privacidade`

Indexation:
- Must not be included in sitemap in this slice.
- Must not be intended for Google Search in this slice.

Behavior:
- May exist as controlled placeholders.
- Must explain that the service/content is not active or finalized yet.
- Must offer a route back to login or landing.

