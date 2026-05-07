Status: ready-for-human

# Internal Operation Registry Executes One User Lookup

## What to build

Create the unexported Internal operation registry Module and prove it with one `users.getByUsername` tracer. The registry entry should own operation ID/path, method, feature flags, Valibot variable schema, response schema, and public Domain operation label; the Domain service should call the registry without hardcoding protocol details.

This is a HITL slice: before implementation, discuss the registry entry shape, schema style, fixture naming, and how much of the GraphQL response shape the first tracer should validate.

## Acceptance criteria

- [ ] A `users.getByUsername` registry entry declares method, operation path or ID, feature flags, variable schema, response schema, and Domain operation label.
- [ ] The registry remains internal and is not exported from the package root.
- [ ] The user Domain service executes the operation through the registry rather than hardcoding protocol details.
- [ ] Variable validation failures throw `TwikitError` with `kind: "schema"`.
- [ ] Response schema failures throw `TwikitError` with `kind: "schema"` and the public Domain operation label.
- [ ] Fixture-backed tests cover successful execution, variable validation, response validation, extra-field tolerance, and operation-label propagation.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/03-authenticated-request-transport-json-endpoint.md
