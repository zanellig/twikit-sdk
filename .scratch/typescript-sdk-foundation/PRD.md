Status: ready-for-agent

# PRD: TypeScript Twikit SDK Foundation

## Problem Statement

The user wants a clean-room TypeScript SDK inspired by Python twikit, with no Python runtime dependency, usable from modern Node.js and Bun code. The Python implementation is useful as a behavioral reference, but its design is broad, Pythonesque, and tightly coupled to active model objects, `httpx`, Python file APIs, and credential login. The first TypeScript release needs strong groundwork and primitives that can expand toward feature parity without copying Python's public shape or forcing brittle abstractions into the SDK.

## Solution

Build an ESM-only TypeScript SDK for Node.js 20+ and Bun 1.1+ that exposes a domain-oriented public API backed by internal protocol primitives. The SDK will support cookie-session based authenticated requests for the MVP, using Web APIs by default with optional adapter injection. It will include session storage, cookie handling, request transport, internal GraphQL operation registry, v1.1 media primitives, transaction-header support, Valibot runtime validation, normalized passive DTOs with per-entity `raw` fragments, active cursor pages, and typed throwing errors.

The first useful feature set is a narrow authenticated MVP: cookie/session management, user lookup, tweet lookup, tweet search, user timelines, tweet create/delete, like/retweet/bookmark actions, and media upload. DMs, lists, communities, notifications, streaming, captcha solvers, credential login, guest client, advanced geo, scheduled tweets, polls, account unlock flows, and compatibility wrappers are deferred until the foundation proves stable.

## User Stories

1. As a TypeScript SDK consumer, I want to install a package that does not require Python, so that my Node.js or Bun project has no Python runtime dependency.
2. As a Node.js service developer, I want an ESM-only SDK, so that the package matches modern TypeScript and Node packaging practices.
3. As a Bun script author, I want the SDK to use standard Web APIs, so that it delegates fetch, headers, forms, blobs, and crypto behavior to my runtime.
4. As an SDK consumer, I want optional adapter injection, so that I can provide a custom `fetch` implementation for tests, proxies, instrumentation, or runtime quirks.
5. As an SDK consumer, I want no browser support claim, so that the SDK does not pretend authenticated X scraping works under browser CORS and cookie constraints.
6. As an SDK consumer, I want a domain-oriented client surface, so that I call `client.users`, `client.tweets`, `client.search`, `client.media`, and `client.session` instead of low-level URLs.
7. As an SDK consumer, I want passive `User` and `Tweet` DTOs, so that returned data is serializable, testable, and easy to pass between modules.
8. As an SDK consumer, I want behavior to live on services rather than domain objects, so that I can call `client.tweets.like(tweet.id)` instead of relying on hidden client references inside `Tweet`.
9. As an SDK consumer, I want cursor pages with `items`, cursors, and `next()`/`previous()` helpers, so that pagination remains ergonomic without making domain entities active records.
10. As an SDK consumer, I want normalized DTO fields, so that common X data is easy to access without navigating internal GraphQL response shapes.
11. As an SDK consumer, I want unknown upstream fields preserved under per-entity `raw`, so that I can access newly exposed fields before the SDK models them.
12. As an SDK maintainer, I want `raw` to contain only the source fragment for each DTO, so that returned entities do not leak or duplicate entire operation responses.
13. As an SDK maintainer, I want an internal GraphQL operation registry, so that query IDs, methods, feature flags, variables, and response validation live in one place.
14. As an SDK maintainer, I want the GraphQL facade to remain internal for MVP, so that consumers depend on the domain API rather than internal X implementation details.
15. As an SDK maintainer, I want operation entries to carry Valibot schemas, so that variables and consumed response fields are validated at runtime.
16. As an SDK maintainer, I want tolerant response validation for extra fields, so that non-breaking X response changes do not break the SDK.
17. As an SDK maintainer, I want strict validation for consumed fields, so that missing IDs, text, cursors, or user fragments fail clearly.
18. As an SDK consumer, I want schema failures to throw clear SDK errors, so that X response changes are diagnosable.
19. As an SDK consumer, I want cookie-session based MVP auth, so that I can use existing authenticated cookies without waiting for brittle credential login support.
20. As an SDK consumer, I want to import cookies from a browser-style cookie header string, so that setup is convenient in code.
21. As an SDK consumer, I want to import structured cookie objects, so that multi-account and persistent applications can manage cookie metadata correctly.
22. As an SDK consumer, I want sessions saved as structured data, so that cookies, user ID, and timestamps can be persisted consistently.
23. As an SDK consumer, I want `MemorySession`, so that tests and short-lived scripts do not require filesystem access.
24. As a Node.js or Bun user, I want `FileSession` under a runtime-specific export, so that filesystem-backed sessions are available without polluting the runtime-neutral core export.
25. As an SDK consumer, I want session persistence decoupled from auth/login methods, so that storage is pluggable and not tied to a `cookiesFile` argument.
26. As an SDK consumer, I want the SDK to derive CSRF from `ct0`, so that authenticated requests include the headers X expects.
27. As an SDK consumer, I want response `set-cookie` updates persisted back to the session store, so that sessions remain fresh across calls.
28. As an SDK maintainer, I want duplicate `ct0` cookies handled consistently, so that request headers do not drift from Python twikit's proven behavior.
29. As an SDK maintainer, I want transaction-header generation as a deep internal module, so that all GraphQL and v1.1 calls can attach `X-Client-Transaction-Id` consistently.
30. As an SDK maintainer, I want transaction initialization to handle X migration and homepage/on-demand script parsing, so that request signing follows the Python implementation's behavioral requirements.
31. As an SDK maintainer, I want GraphQL and v1.1 protocol layers separated internally, so that media upload and legacy endpoints do not distort the GraphQL operation model.
32. As an SDK consumer, I want media upload support in the MVP, so that creating tweets with images or videos is possible.
33. As an SDK consumer, I want media upload to support bytes/blob-like inputs, so that runtime-neutral code can upload generated or fetched media.
34. As a Node.js or Bun user, I want file-path upload helpers outside the runtime-neutral core or isolated behind runtime helpers, so that core does not depend on `node:fs`.
35. As an SDK consumer, I want media upload to support chunked INIT/APPEND/FINALIZE behavior, so that large media follows X's v1.1 upload flow.
36. As an SDK consumer, I want optional media processing polling, so that video and gif uploads can wait until X finishes processing.
37. As an SDK consumer, I want tweet search by query and product, so that I can retrieve top, latest, or media results.
38. As an SDK consumer, I want user lookup by username and ID, so that I can resolve users before timeline and action calls.
39. As an SDK consumer, I want tweet lookup by ID, so that I can retrieve a single tweet and its normalized author/media data.
40. As an SDK consumer, I want user timeline listing, so that I can retrieve tweets, replies, media, and likes where supported.
41. As an SDK consumer, I want tweet creation and deletion, so that basic write workflows are supported.
42. As an SDK consumer, I want like, unlike, retweet, unretweet, bookmark, and unbookmark operations, so that common tweet actions are supported.
43. As an SDK consumer, I want typed SDK errors thrown by default, so that application code can use ordinary `try`/`catch`.
44. As an SDK consumer, I want stable error categories, so that my error handling does not depend on every X error-code variant.
45. As an SDK consumer, I want upstream status, code, headers, operation, and raw details preserved on errors, so that failures are diagnosable.
46. As an SDK consumer, I want domain-level operation labels in errors, so that logs identify `users.getByUsername` or `search.tweets` instead of internal GraphQL keys.
47. As an SDK consumer, I want rate-limit reset metadata on 429 errors when present, so that backoff can use X's reset timestamp.
48. As an SDK maintainer, I want rate-limit metadata to match Python twikit's proven implementation initially, so that we do not overfit undocumented headers.
49. As an SDK maintainer, I want account locked and suspended cases recognized from GraphQL error codes, so that auth-related failures have stable categories.
50. As an SDK maintainer, I want duplicate tweet and invalid media codes mapped into stable SDK error kinds/details, so that common write failures are handled intentionally.
51. As an SDK maintainer, I want no CLI or console IO in the SDK, so that all interactivity remains in consuming applications.
52. As an SDK maintainer, I want credential login designed but not implemented in MVP, so that later challenge callbacks can fit without reshaping the client.
53. As an SDK consumer, I want custom user-agent configuration, so that requests can match browser-like expectations and application needs.
54. As an SDK consumer, I want language configuration, so that request headers can match the locale behavior available in Python twikit.
55. As an SDK maintainer, I want feature parity to grow through domain services, so that the public API stays coherent as DMs, lists, communities, trends, and streaming are added later.

## Implementation Decisions

- This is a clean-room TypeScript implementation. Python twikit is a behavioral reference, not a runtime dependency and not a literal source port.
- The npm package name is `twikit-sdk`.
- The project uses the same license as Python twikit and includes clear README attribution to `d60/twikit` as the behavioral inspiration.
- The SDK targets Node.js 20+ and Bun 1.1+ with ESM-only packaging. CommonJS is out of scope for MVP.
- The core package uses Web APIs by default: `fetch`, `Headers`, `Request`, `Response`, `FormData`, `Blob`, and runtime-provided crypto where needed.
- The client accepts optional adapter injection, especially for `fetch`.
- The package exposes runtime-neutral core APIs from the root export and filesystem helpers from a runtime-specific export.
- `FileSession` lives outside the core export. `MemorySession` and core session abstractions live in the root export.
- The public API is service-oriented rather than a literal Python API port. Domain services own behavior; domain DTOs are passive.
- Python twikit's active model methods such as tweet/user instance actions are intentionally not copied into the primary public API.
- A later compatibility layer may provide Python-like aliases, but compatibility aliases are not part of the MVP.
- Returned domain objects include normalized semver-governed fields and a per-entity `raw` source fragment for unknown upstream fields.
- `raw` does not contain the entire operation response and should not expose internal operation registry details.
- Cursor pagination uses active `Page<T>` objects with passive items. Pages include `items`, optional cursors, and `next()`/`previous()` helpers where the cursor exists.
- Cookie-session auth is the MVP. Credential login, challenge handling, TOTP, UI metrics login flow, account unlock, and captcha solver integration are designed for later but not implemented now.
- Session management is pluggable through a session store abstraction. The SDK supports structured cookie import and cookie-header import, normalizing both into structured stored cookies.
- Cookie parsing and storage semantics use `tough-cookie` rather than an ad hoc cookie implementation.
- Session files contain live auth cookies and must be treated as secrets. File-backed session storage should avoid permissive file modes where the runtime allows it, and docs must warn users not to commit session files.
- The SDK derives CSRF headers from `ct0`, includes bearer and X auth headers, supports language headers, supports user-agent configuration, and persists cookie updates after responses.
- The implementation must account for Python twikit's duplicate `ct0` cleanup behavior.
- The internal request layer maps HTTP status codes and GraphQL error envelopes into `TwikitError`.
- Errors are thrown by default. The SDK does not use result-returning methods as the primary API.
- `TwikitError` is the primary error class with broad stable `kind` categories, plus metadata for status, upstream code, headers, domain operation label, raw payload, and optional rate-limit data.
- Domain-level operation labels are public diagnostic metadata. Internal GraphQL query IDs and paths are not public API.
- Rate-limit metadata starts as reset-only, matching Python twikit's implementation. The SDK should parse `x-rate-limit-reset` on 429 when present and expose `resetAt` and `resetEpochSeconds`. Other rate-limit headers may remain available through raw headers.
- Account suspended codes observed in Python twikit, including 37 and 64, map to an account-suspended kind. Account locked code 326 maps to account-locked.
- Python twikit maps code 187 to duplicate tweet and 324 to invalid media. The TypeScript SDK should preserve these as stable error details or specialized kinds if the chosen error taxonomy includes them.
- Internal GraphQL execution is operation-registry driven. Each operation declares method, path/query ID, feature flags, variable schema, response schema, and domain operation label.
- Operation IDs live in the internal registry, with fixture-backed tests covering expected operation paths and payload shapes. When X changes an operation ID, a maintainer updates the registry entry, refreshes the relevant fixture, and documents the change.
- The internal GraphQL facade remains unexported for MVP.
- Valibot is used for runtime schemas. Schemas validate operation variables and the response fragments consumed by mappers.
- The repo-local Valibot skill should be read before implementing schema-heavy slices so schema style stays consistent.
- Runtime response validation is tolerant of unknown extra fields and strict for consumed fields.
- The SDK should not attempt to model entire X GraphQL responses up front. It validates the fragments needed for normalized DTOs and cursor behavior.
- GraphQL and v1.1 clients are separate internal protocol modules. GraphQL handles timeline/search/tweet/user/actions. v1.1 handles media upload and legacy support endpoints.
- Media upload supports INIT, chunked APPEND with 8 MB segment behavior, FINALIZE, optional STATUS polling, and media metadata where included in MVP.
- File-path media upload should be isolated from runtime-neutral core. The core media service should accept runtime-neutral binary/blob inputs.
- Transaction-header generation is a deep module. It initializes from X homepage/migration behavior, parses the on-demand script, computes key bytes and animation key, and generates `X-Client-Transaction-Id` per method/path.
- The SDK should keep transaction details internal and testable. Consumers should not know how transaction IDs are generated.
- The MVP domain modules are client composition, session/cookies, request transport, errors, transaction IDs, operation registry, Valibot schema parsing, DTO mappers, pagination, users, tweets, search, media, and runtime-specific file session helpers.
- Vitest is the test runner. Do not add Bun-specific test paths or Bun-specific implementation branches for MVP.
- Deferred feature parity modules include guest access, DMs, groups, lists, bookmarks folders beyond core bookmark actions, communities, trends, notifications, streaming, geo, polls, scheduled tweets, delegated accounts, captcha providers, unlock flows, and full credential login.

## Testing Decisions

- Tests should cover external behavior and public contracts, not private implementation details.
- Deep modules should be tested in isolation where possible: cookie normalization, session persistence, request header construction, CSRF extraction, transaction ID generation, operation registry execution, Valibot validation behavior, DTO mapping, pagination, and error mapping.
- Request tests should use injected `fetch` and fixture responses rather than live X network calls.
- Schema tests should verify that unknown extra fields pass through into `raw`, while missing consumed fields produce a schema error with the public domain operation label.
- Error tests should verify HTTP status mapping, GraphQL error-envelope mapping, account locked/suspended codes, duplicate tweet and invalid media codes, and 429 reset parsing.
- Session tests should verify import from cookie header strings, import from structured cookies, structured persistence, set-cookie updates, duplicate `ct0` handling, and file helper behavior.
- Pagination tests should verify items, cursor extraction, empty cursor behavior, and `next()`/`previous()` request continuation.
- Transaction tests should use static HTML and on-demand script fixtures derived from the behavioral shape of Python twikit, not live homepage scraping.
- Media tests should verify upload orchestration using mocked v1.1 responses: init, chunk append boundaries, finalize, status polling success, and processing error failure.
- Domain service tests should verify service-level behavior such as user lookup, tweet lookup, search, tweet creation, and tweet actions using mocked operation responses.
- No MVP test should require real X credentials, real cookies, live network access, Python, or browser automation.

## Out of Scope

- Python runtime integration or wrapping Python twikit.
- Literal public API port of Python twikit.
- CommonJS build output.
- Browser support.
- Built-in CLI, prompts, stdin, stdout, or interactive UI behavior.
- Credential login implementation for MVP.
- TOTP, email/phone challenge handling, UI metrics login execution, account unlock, captcha provider integration, and automatic unlock behavior.
- Public raw GraphQL facade.
- Guest client support.
- DMs, groups, lists, communities, notifications, trends, streaming, geo, polls, scheduled tweets, delegated accounts, and complete feature parity.
- Live integration tests against X in the MVP test suite.

## Further Notes

The Python implementation confirms several protocol realities that the TypeScript design must respect: authenticated requests derive CSRF from `ct0`, include browser-like headers, attach `X-Client-Transaction-Id`, separate GraphQL from v1.1 endpoints, use cursor-based result continuations, and treat 429 reset metadata as opportunistic. The TypeScript SDK should intentionally diverge from Python's active model object philosophy while preserving these protocol primitives as internal deep modules.

The agreed public API sketches are captured in `.scratch/typescript-sdk-foundation/API-SKETCH.md`. Implementation issues should preserve those shapes unless a later issue explicitly changes the contract.
