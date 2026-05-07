Status: ready-for-agent

# Transaction Fixture Provenance

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Create the sanitized fixture set and provenance notes needed to test the transaction ID module without live X calls in CI. Fixtures should be captured from live public X assets, minimized to the fragments required by the parser, and documented with source URL, capture date, removed content, and refresh instructions.

## Acceptance criteria

- [ ] Public X homepage and on-demand script assets are captured only for the fragments needed by transaction parsing tests.
- [ ] Fixtures are minimized and sanitized so they contain no cookies, account data, secrets, or unnecessary full-page/full-bundle content.
- [ ] Each fixture has provenance metadata including source URL, capture date, purpose, and sanitization notes.
- [ ] A manual refresh note explains how maintainers can recapture and re-minimize fixtures.
- [ ] CI/unit tests are expected to consume committed fixtures and must not fetch live X assets.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/03-request-transport-error-mapping.md
