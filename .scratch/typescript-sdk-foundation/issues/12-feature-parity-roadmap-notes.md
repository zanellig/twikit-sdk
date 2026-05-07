Status: ready-for-human

# Feature-Parity Roadmap Notes

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

After the MVP foundation exists, capture a human-reviewed roadmap for expanding toward Python twikit feature parity. The roadmap should prioritize future modules such as credential login, guest client, DMs, groups, lists, communities, trends, notifications, streaming, geo, polls, scheduled tweets, delegated accounts, captcha providers, and unlock flows.

## Acceptance criteria

- [ ] The roadmap starts from observed MVP implementation constraints rather than speculative ordering.
- [ ] Each future feature area is grouped by dependency on existing primitives such as session, GraphQL registry, v1.1 transport, pagination, or streaming.
- [ ] Credential login and challenge handling remain callback-based and non-interactive.
- [ ] The roadmap records which future slices are likely AFK and which require human review.
- [ ] The roadmap does not modify or close the parent PRD.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/11-mvp-integration-examples-contract-tests.md
