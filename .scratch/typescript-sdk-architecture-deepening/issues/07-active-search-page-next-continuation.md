Status: ready-for-human

# Active Search Page Supports First Page And Next Continuation

## What to build

Add a narrow `client.search.tweets` tracer that returns an Active page of Passive tweet DTOs. The Page factory should own items, cursor extraction, empty cursor behavior, and `next()` continuation through the operation registry.

This is a HITL slice: before implementation, discuss the Page factory Interface, what `next()` and `previous()` do when cursors are absent, and the minimum Tweet DTO fields needed for the first search tracer.

## Acceptance criteria

- [ ] `client.search.tweets` returns a Page containing normalized Passive tweet DTOs.
- [ ] Page creation extracts items and cursors from fixture-backed mocked operation responses.
- [ ] Empty or missing cursors are handled predictably without normal pagination throwing unexpectedly.
- [ ] `next()` executes a continuation request through the operation registry when a next cursor exists.
- [ ] Tweet `raw` values contain only per-tweet source fragments.
- [ ] Tests cover first-page mapping, cursor extraction, empty cursor behavior, next continuation, and passive DTO behavior.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/05-internal-operation-registry-user-lookup.md
