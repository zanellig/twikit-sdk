Status: ready-for-human

# Session Stores Round-Trip Cookie Snapshots Across Memory And File Adapters

## What to build

Prove the `SessionStore` Seam with both runtime-neutral memory storage and runtime-specific file storage. A session snapshot should round-trip through both Adapters without losing cookies, user metadata, or timestamps, while keeping filesystem behavior out of the root export.

This is a HITL slice: before implementation, discuss the snapshot shape, timestamp ownership, file permission expectations, and whether `FileSession` should eagerly or lazily persist normalized data.

## Acceptance criteria

- [ ] `MemorySession` round-trips normalized session snapshots without exposing mutable internal state.
- [ ] `FileSession` round-trips normalized session snapshots through the runtime-specific export.
- [ ] Session snapshots include cookies plus optional user ID and timestamp metadata.
- [ ] File-backed session writes use restrictive permissions where supported.
- [ ] The runtime-neutral root export remains free of filesystem helpers.
- [ ] Tests cover memory storage, file storage, snapshot cloning, timestamp behavior, and package exports.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/01-cookie-session-import-request-ready-auth-state.md
