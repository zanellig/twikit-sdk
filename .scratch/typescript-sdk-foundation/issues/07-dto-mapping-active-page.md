Status: ready-for-human

# DTO Mapping And Active Page Primitive

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Implement normalized passive DTO mapping for users and tweets, preserving per-entity source fragments under `raw`, and add the active `Page<T>` primitive for cursor continuations.

## Acceptance criteria

- [ ] User and tweet mappers return passive serializable DTOs with normalized fields and per-entity `raw`.
- [ ] `raw` contains only the source fragment used for that DTO, not the entire operation response.
- [ ] Domain DTOs do not hold hidden client references or active methods.
- [ ] `Page<T>` exposes `items`, optional cursors, and `next()`/`previous()` helpers where continuations exist.
- [ ] Empty or missing cursors are handled predictably without throwing during normal pagination.
- [ ] Tests cover mapping, raw-fragment preservation, extra-field preservation, cursor extraction, and page continuation behavior.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/06-internal-gql-operation-registry-valibot.md
