Status: ready-for-human

# Authenticated Request Transport Handles One JSON Endpoint End To End

## What to build

Introduce the internal request transport Module and prove it with one mocked JSON endpoint. A request should include session cookies, CSRF, bearer and X headers, language, user agent, and injected fetch behavior; the response should update session cookies, parse JSON, and map basic transport failures into `TwikitError`.

This is a HITL slice: before implementation, discuss the private transport Interface passed to Domain services, what request options it accepts, and where response cookie persistence sits.

## Acceptance criteria

- [ ] A mocked authenticated request includes cookies, CSRF, bearer/X headers, language, and user agent.
- [ ] Injected `fetch` is the only network Adapter used by the transport.
- [ ] Response `set-cookie` values update the session through the Cookie session Module.
- [ ] Successful JSON responses are parsed and returned through the internal transport Interface.
- [ ] Network failures and representative HTTP failures throw `TwikitError`.
- [ ] Tests cover request headers, injected fetch, JSON parsing, response cookie persistence, and basic error mapping.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/01-cookie-session-import-request-ready-auth-state.md
