Status: ready-for-human

# Transaction ID Module

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Implement the internal `X-Client-Transaction-Id` module as a deep, fixture-tested protocol primitive. It should initialize from the sanitized public X fixtures, parse the homepage and on-demand script shape, compute key bytes and animation key, and generate a transaction ID for each method/path.

## Acceptance criteria

- [ ] The module initializes from the committed homepage and on-demand script fixtures without live X network access.
- [ ] Transaction IDs are generated from method and request path using the same behavioral inputs as Python twikit.
- [ ] Request transport attaches `X-Client-Transaction-Id` where required.
- [ ] Failures to initialize transaction data become clear SDK errors with useful operation context.
- [ ] Tests cover migration fixture handling, key extraction, on-demand index extraction, animation-key computation, deterministic generation inputs, and request integration.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/04-transaction-fixture-provenance.md
