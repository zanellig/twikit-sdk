Status: ready-for-human

# Internal GraphQL Operation Registry With Valibot

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Create the unexported GraphQL operation registry and execution facade. Each operation should declare method, path/query ID, feature flags, variable schema, response fragment schema, and public domain operation label. Valibot validates variables and consumed response fragments while tolerating unknown extra fields. Operation IDs live in this registry and are updated manually when X changes them.

## Acceptance criteria

- [ ] Domain services can call an internal operation executor by registry key without hardcoding full URLs.
- [ ] The repo-local Valibot skill is consulted before establishing schema style.
- [ ] Registry entries include method, path/query ID, feature flags, Valibot variable schema, Valibot response schema, and domain operation label.
- [ ] Fixture-backed tests cover expected operation paths and payload shapes for the initial MVP operations.
- [ ] Maintainer docs explain that operation ID changes are handled by updating the registry entry, refreshing the relevant fixture, and documenting the change.
- [ ] Variable validation failures and response schema failures throw `TwikitError` with `kind: "schema"`.
- [ ] Unknown extra response fields are tolerated and remain available for DTO `raw` fragments.
- [ ] The registry and facade remain internal and are not part of the root public API.
- [ ] Tests cover successful execution, variable validation, response validation, extra-field tolerance, and operation-label propagation.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/03-request-transport-error-mapping.md
