Status: ready-for-human

# GraphQL Error Envelopes Map To Stable TwikitError Metadata

## What to build

Deepen request transport error handling for GraphQL error envelopes. The SDK should map known upstream statuses and error codes into stable `TwikitError` metadata while preserving public Domain operation labels, raw payloads, headers, and reset-only rate-limit data.

This is a HITL slice: before implementation, discuss the exact taxonomy for duplicate tweet and invalid media, what raw data is preserved, and how operation labels flow through the transport Interface.

## Acceptance criteria

- [ ] GraphQL account locked errors map to the stable account-locked error kind.
- [ ] GraphQL account suspended errors map to the stable account-suspended error kind.
- [ ] Duplicate tweet and invalid media cases map to stable SDK metadata.
- [ ] Public errors include Domain operation labels rather than internal GraphQL paths.
- [ ] 429 responses parse `x-rate-limit-reset` into reset-only rate-limit metadata when present.
- [ ] Tests cover status mapping, GraphQL envelope mapping, raw/header preservation, operation labels, and 429 reset parsing.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/03-authenticated-request-transport-json-endpoint.md
