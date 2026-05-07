Status: ready-for-agent

# Scaffold ESM SDK With Runtime-Neutral Client Shell

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Create the initial TypeScript SDK package foundation with ESM-only packaging, runtime-neutral root exports, a runtime-specific helper export, a `TwikitClient` shell, optional adapter injection, service namespaces, and initial documentation/examples that preserve the public API sketches.

## Acceptance criteria

- [ ] The package builds as ESM-only and exposes a runtime-neutral root entrypoint plus a runtime-specific helper entrypoint.
- [ ] The package is named `twikit-sdk`, uses the same license as Python twikit, and includes README attribution to `d60/twikit` without copying Python source.
- [ ] `TwikitClient` can be constructed with language, user agent, session, and optional `fetch` adapter options.
- [ ] Service namespaces exist for session, users, tweets, search, media, and future auth without implementing network behavior yet.
- [ ] The public API examples from `.scratch/typescript-sdk-foundation/API-SKETCH.md` are represented in docs or tests as compile-time contracts where practical.
- [ ] Vitest-based unit/build/typecheck commands exist and can run without Python, live X credentials, browser automation, Bun-specific test paths, or network access.

## Blocked by

None - can start immediately
