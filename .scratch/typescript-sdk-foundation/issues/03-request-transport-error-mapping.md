Status: ready-for-human

# Request Transport And TwikitError Mapping

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Implement authenticated request execution and SDK error mapping. Requests should use session cookies, CSRF, bearer and X auth headers, language/user-agent options, injected fetch, response parsing, HTTP status mapping, GraphQL error-envelope mapping, domain operation labels, raw/headers metadata, and reset-only 429 rate-limit parsing.

## Acceptance criteria

- [ ] Requests include the expected authenticated browser-like headers derived from client options and session state.
- [ ] Network failures and HTTP failures throw `TwikitError` by default with stable `kind` categories.
- [ ] GraphQL error envelopes map account-locked, account-suspended, duplicate tweet, and invalid media cases into stable error metadata.
- [ ] Public errors include domain operation labels and do not expose internal GraphQL paths as the primary operation name.
- [ ] 429 responses parse `x-rate-limit-reset` into `rateLimit.resetAt` and `rateLimit.resetEpochSeconds` when present.
- [ ] Tests cover status mapping, GraphQL error mapping, raw/header preservation, operation labels, network errors, and 429 reset parsing.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/02-cookie-session-import-persistence.md
