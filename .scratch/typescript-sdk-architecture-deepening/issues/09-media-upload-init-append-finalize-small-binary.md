Status: ready-for-human

# Media Upload Completes INIT/APPEND/FINALIZE For A Small Binary

## What to build

Add the first v1.1 media upload vertical slice. `client.media.upload` should accept runtime-neutral binary input, perform INIT, APPEND, and FINALIZE through the request transport, and return a media ID that can be passed to tweet creation later.

This is a HITL slice: before implementation, discuss the v1.1 protocol Module Interface, binary normalization rules, chunk sizing, and how media upload should share or differ from GraphQL transport behavior.

## Acceptance criteria

- [ ] `client.media.upload` accepts runtime-neutral binary input and media type options.
- [ ] Upload performs INIT, one or more APPEND calls, and FINALIZE against mocked v1.1 responses.
- [ ] Small binary upload returns a media ID string.
- [ ] v1.1 upload requests use the shared authenticated request behavior where appropriate.
- [ ] Media upload failures map to `TwikitError` with useful metadata.
- [ ] Tests cover binary normalization, INIT/APPEND/FINALIZE ordering, returned media ID, and transport-backed error handling.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/03-authenticated-request-transport-json-endpoint.md
