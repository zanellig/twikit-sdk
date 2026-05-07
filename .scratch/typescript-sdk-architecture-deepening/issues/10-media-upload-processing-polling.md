Status: ready-for-human

# Media Upload Polling Handles Processing Success And Failure

## What to build

Extend media upload for `waitForProcessing`. After FINALIZE indicates processing is pending, the SDK should poll STATUS until success or failure, map invalid media and processing failures into `TwikitError`, and avoid live X network access in tests.

This is a HITL slice: before implementation, discuss polling limits, delay injection for tests, terminal-state handling, and the exact error metadata exposed for processing failures.

## Acceptance criteria

- [ ] `waitForProcessing` triggers STATUS polling when FINALIZE indicates pending processing.
- [ ] Successful processing resolves with the media ID.
- [ ] Failed processing throws `TwikitError` with invalid-media or useful failure metadata.
- [ ] Polling behavior is testable without real timers causing slow tests.
- [ ] Terminal and timeout behavior is specified and covered by tests.
- [ ] Tests cover polling success, polling failure, invalid media mapping, and timeout or terminal-state handling.

## Blocked by

- .scratch/typescript-sdk-architecture-deepening/issues/09-media-upload-init-append-finalize-small-binary.md
