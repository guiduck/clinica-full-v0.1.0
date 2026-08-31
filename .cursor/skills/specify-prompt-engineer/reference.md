# Specify Prompt Engineer Reference

## Output Shape for `/speckit.specify`
Prefer a compact business-first prompt:

```markdown
Create a feature specification for <feature>.

Primary user: <actor>
Goal: <outcome>

In scope:
- ...

Constraints:
- ...

Integrations:
- ...

Acceptance expectations:
- ...

Out of scope:
- ...
```

## Output Shape for `/speckit.clarify`
Turn ambiguity into narrow questions:

```markdown
Clarify these high-impact decisions for <feature>:
- <decision 1>
- <decision 2>

Prefer defaults already accepted in project docs unless contradicted.
```

## Output Shape for `/speckit.plan`
Convert the feature into a technical planning brief:

```markdown
Plan implementation for <feature> using current project decisions.

Relevant defaults:
- stack: ...
- auth: ...
- payments: ...
- notifications: ...

Focus on:
- data model impact
- integrations
- user flow
- risks
- rollout/testing shape
```

## Compression Rules
- Keep only feature-relevant context.
- Prefer bullets over long prose.
- Keep user language for domain concepts.
- If a detail is already fixed in ADR/docs, state it once and move on.
