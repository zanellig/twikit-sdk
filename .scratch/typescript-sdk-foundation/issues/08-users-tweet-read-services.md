Status: ready-for-human

# Users And Tweet Read Services

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Implement the first registry-backed domain read services: user lookup by username and ID, tweet lookup by ID, tweet search, and user tweet listing. These should use normalized DTOs, active pages, domain operation labels, and mocked X response fixtures.

## Acceptance criteria

- [ ] `client.users.getByUsername` and `client.users.getById` return normalized passive user DTOs.
- [ ] `client.tweets.getById` returns a normalized passive tweet DTO with author/media fragments where present.
- [ ] `client.search.tweets` supports query, product, limit, and cursor pagination.
- [ ] `client.tweets.listByUser` supports the MVP timeline types and cursor pagination.
- [ ] User-not-found, unavailable-user, tweet-unavailable, schema, and auth failures throw typed SDK errors with domain operation labels.
- [ ] Tests cover successful reads, pagination, not-found/unavailable cases, raw fragments, and schema failures without live X calls.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/07-dto-mapping-active-page.md
