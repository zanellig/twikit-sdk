Status: ready-for-human

# User DTO Mapper Preserves Only The Raw User Fragment

## What to build

Add the first DTO mapping Module for `User`, wired through `client.users.getByUsername`. The mapper should return a normalized Passive DTO, tolerate unknown upstream fields, fail clearly on missing consumed fields, and preserve only the upstream user source fragment under `raw`.

This is a HITL slice: before implementation, discuss the exact normalized `User` field defaults, which upstream fragment counts as the Raw fragment, and whether schema validation or mapper code owns each invariant.

## Acceptance criteria

- [ ] `client.users.getByUsername` returns a normalized Passive `User` DTO.
- [ ] The returned `raw` value contains only the upstream user source fragment, not the entire operation response.
- [ ] Unknown extra upstream fields are tolerated and remain available in `raw`.
- [ ] Missing consumed user fields fail with a schema error carrying the Domain operation label.
- [ ] The `User` DTO has no hidden client reference or active methods.
- [ ] Tests cover normalized fields, raw-fragment preservation, extra-field tolerance, missing consumed fields, and passive DTO behavior.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/05-internal-operation-registry-user-lookup.md
