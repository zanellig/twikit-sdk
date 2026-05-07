# Context

This repo is for `twikit-sdk`: a clean-room TypeScript SDK inspired by Python `d60/twikit`.

Python twikit is a behavioral reference, not a runtime dependency and not a literal source port. The TypeScript SDK should preserve the useful protocol primitives while avoiding Python twikit's active-record style public API.

## Core Vocabulary

- **Clean-room SDK**: A TypeScript implementation with no Python runtime, no copied Python source, and behavior informed by Python twikit.
- **Behavioral reference**: Python twikit is used to understand X protocol behavior, response shapes, and edge cases.
- **Domain service**: A public client namespace that owns behavior, such as `client.users`, `client.tweets`, `client.search`, `client.media`, and `client.session`.
- **Passive DTO**: A returned data object with normalized fields and no hidden client reference or active methods.
- **Active page**: A pagination object with `items`, cursors, and `next()`/`previous()` helpers. Pages may be active because they represent request continuations.
- **Raw fragment**: The upstream source fragment used to build a DTO, exposed as `raw`. It is not the entire operation response.
- **Internal operation registry**: The unexported registry of GraphQL operation IDs, paths, methods, feature flags, Valibot schemas, and public domain operation labels.
- **Domain operation label**: A public diagnostic label on errors, such as `users.getByUsername`, not an internal GraphQL query ID.
- **Cookie session**: The MVP auth model. Consumers provide existing X cookies; credential login is deferred.
- **Session store**: Pluggable persistence for session data. `MemorySession` is runtime-neutral; `FileSession` lives under the runtime-specific export.
- **Transaction ID module**: The internal module that generates `X-Client-Transaction-Id` from public X asset fixtures.
- **v1.1 media upload**: The INIT/APPEND/FINALIZE upload flow used before tweet creation with media.
- **TwikitError**: The primary thrown SDK error with stable `kind`, status/code metadata, headers, raw payload, domain operation label, and optional reset-only rate-limit data.

## Product Shape

- Package name: `twikit-sdk`.
- Runtime target: Node.js 20+ and Bun 1.1+.
- Module format: ESM-only.
- Browser support: out of scope.
- CommonJS support: out of scope.
- Test runner: Vitest.
- Cookie implementation: `tough-cookie`.
- Runtime model: Web APIs by default, with optional adapter injection.
- Filesystem helpers: exposed separately from the runtime-neutral root export.

## Public API Philosophy

Prefer this:

```ts
const user = await client.users.getByUsername("example_user")
const page = await client.search.tweets("typescript", { product: "latest" })
await client.tweets.like(page.items[0].id)
```

Avoid this as the primary API:

```ts
const user = await client.getUserByScreenName("example_user")
await user.follow()
await tweet.favorite()
```

Domain entities stay serializable. Behavior lives on services. A later compatibility layer may add Python-like aliases, but it is not part of the MVP.

## Protocol Realities From Python twikit

- Authenticated requests derive CSRF from the `ct0` cookie.
- Requests need browser-like headers, language headers, bearer auth, cookies, and transaction IDs.
- GraphQL and v1.1 endpoints are separate internal protocol layers.
- Media upload uses v1.1 INIT/APPEND/FINALIZE and optional STATUS polling.
- Cursor pagination is central to search and timelines.
- Python twikit parses only `x-rate-limit-reset` into a special rate-limit field; the TypeScript MVP should expose reset-only public rate-limit metadata.
- Important upstream error codes include account suspended `37`/`64`, account locked `326`, duplicate tweet `187`, and invalid media `324`.

## Fixture Policy

Tests must not fetch live X assets in CI. Transaction fixtures should be captured from live public X assets by a dedicated task, minimized, sanitized, committed, and documented with source URL, capture date, removed content, and refresh instructions.

Operation IDs live in the internal registry. When X changes an operation ID, maintainers update the registry entry, refresh the relevant fixture, and document the change.

## Security

Session files contain live auth cookies and must be treated as secrets. They should not be committed. File-backed session storage should use restrictive permissions where supported by the runtime.

## Planning Artifacts

- PRD: `.scratch/typescript-sdk-foundation/PRD.md`
- API sketch: `.scratch/typescript-sdk-foundation/API-SKETCH.md`
- Implementation issues: `.scratch/typescript-sdk-foundation/issues/`
