Status: ready-for-human

# Tweet Action Mutation Uses Registry And Transport Error Mapping

## What to build

Implement one tweet action mutation path, such as `client.tweets.like`, through the Internal operation registry and request transport. The slice should prove Domain services stay thin while registry entries, operation labels, and mapped GraphQL errors carry the protocol behavior.

This is a HITL slice: before implementation, discuss which tweet action should be the first tracer, what the successful mutation returns internally, and how unavailable tweet or authorization failures should surface.

## Acceptance criteria

- [ ] One tweet action Domain service method executes through the Internal operation registry.
- [ ] The action method preserves the existing public service-oriented Interface.
- [ ] Successful mocked mutation responses resolve without exposing internal GraphQL details.
- [ ] Auth, unavailable tweet, rate-limit, and schema failures map to `TwikitError` with useful metadata.
- [ ] Public errors include the correct Domain operation label.
- [ ] Tests cover successful action execution and mapped error cases using mocked operation responses.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/04-graphql-error-envelopes-twikit-error-metadata.md
- .scratch/typescript-sdk-architecture-deepening/issues/05-internal-operation-registry-user-lookup.md
