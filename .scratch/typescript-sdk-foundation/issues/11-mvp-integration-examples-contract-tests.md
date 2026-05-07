Status: ready-for-agent

# MVP Integration Examples And Contract Tests

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Add mocked end-to-end examples and contract tests that demonstrate the MVP as consumers will use it: cookie import, session persistence, user lookup, search pagination, tweet creation with media, tweet actions, and typed error handling.

## Acceptance criteria

- [ ] Examples compile and reflect the agreed API sketches for construction, sessions, domain services, pagination, media upload, and error handling.
- [ ] Contract tests exercise full consumer flows with injected fetch and fixtures only.
- [ ] The Vitest suite verifies the MVP has no Python runtime dependency, no live X credential requirement, no browser dependency, no Bun-specific requirement, and no CLI/console IO assumption.
- [ ] Documentation makes clear that browser support, credential login, guest access, DMs, lists, communities, notifications, trends, streaming, geo, polls, and scheduled tweets are out of scope for MVP.
- [ ] All examples and tests pass through the public client surface rather than internal protocol APIs.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/08-users-tweet-read-services.md
- .scratch/typescript-sdk-foundation/issues/09-tweet-write-action-services.md
- .scratch/typescript-sdk-foundation/issues/10-v11-media-upload-service.md
