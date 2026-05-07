Status: ready-for-agent

# Tweet Write And Action Services

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Implement MVP tweet write and action services through the internal GraphQL registry: tweet create/delete, like/unlike, retweet/unretweet, bookmark/unbookmark, and reply if included in the agreed service shape. Preserve the service-oriented API and error taxonomy.

## Acceptance criteria

- [ ] Consumers can create and delete tweets using service methods, with optional media IDs where supported by the MVP.
- [ ] Consumers can like, unlike, retweet, unretweet, bookmark, and unbookmark tweets using service methods.
- [ ] Reply behavior follows the service-oriented API sketch if implemented in this slice.
- [ ] Duplicate tweet, invalid media, unavailable tweet, auth, rate-limit, and schema failures map to `TwikitError` with useful metadata.
- [ ] Returned created tweets are passive DTOs with per-entity `raw`.
- [ ] Tests cover successful writes/actions and mapped error cases using mocked operation responses.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/08-users-tweet-read-services.md
