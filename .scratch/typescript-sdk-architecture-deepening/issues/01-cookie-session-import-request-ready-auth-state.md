Status: ready-for-human

# Cookie Session Import Produces Request-Ready Auth State

## What to build

Deepen the Cookie session Module enough that imported cookies become request-ready auth state. Consumers should be able to import a browser cookie header or structured cookie objects, have them normalized through the cookie jar behavior, persist them as a session snapshot, and have the SDK derive the CSRF token from `ct0` for later request transport use.

This is a HITL slice: before implementation, discuss the exact Cookie session Module Interface, duplicate `ct0` behavior, and what auth-state helpers stay internal.

## Acceptance criteria

- [ ] Cookie-header import accepts a browser-style header and persists structured cookies.
- [ ] Structured cookie import persists cookie metadata needed by authenticated X requests.
- [ ] Cookie parsing and jar semantics use `tough-cookie` rather than ad hoc parsing.
- [ ] The SDK can derive the CSRF token from `ct0` through an internal Interface.
- [ ] Duplicate `ct0` cleanup behavior is specified and covered by tests.
- [ ] Tests cover header import, structured import, CSRF extraction, persistence, and duplicate `ct0` behavior without live network access.

## Blocked by

None - can start immediately
