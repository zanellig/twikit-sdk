Status: ready-for-human

# Cookie Session Import And Persistence

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Implement cookie-session storage for the MVP using `tough-cookie`, including in-memory storage, filesystem-backed storage under the runtime helper export, cookie-header import, structured cookie import, CSRF extraction from `ct0`, set-cookie persistence, duplicate `ct0` cleanup behavior, and session-file secret handling.

## Acceptance criteria

- [ ] Consumers can import cookies from a browser-style cookie header string and from structured cookie objects.
- [ ] Cookie parsing and jar behavior use `tough-cookie` rather than ad hoc cookie parsing.
- [ ] Session data persists structured cookies, optional user ID, and timestamps.
- [ ] `MemorySession` works from the root export and `FileSession` works from the runtime-specific export.
- [ ] The client can derive the CSRF token from `ct0` and expose it internally for request headers.
- [ ] Response `set-cookie` values update the session store, including duplicate `ct0` cleanup compatible with the Python twikit behavior.
- [ ] File-backed sessions are documented as secret-bearing files and use restrictive permissions where supported by the runtime.
- [ ] Tests cover header import, structured import, persistence, set-cookie updates, duplicate `ct0`, and file storage without live network access.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/01-scaffold-esm-sdk-client-shell.md
