Status: ready-for-human

# v1.1 Media Upload Service

## Parent

.scratch/typescript-sdk-foundation/PRD.md

## What to build

Implement the internal v1.1 media upload flow exposed through `client.media.upload`. The public service accepts runtime-neutral binary/blob inputs and returns a media ID that can be passed to tweet creation. Internally, it performs INIT, chunked APPEND, FINALIZE, and optional STATUS polling.

## Acceptance criteria

- [ ] `client.media.upload` accepts runtime-neutral binary/blob-like media input and optional media type/category options.
- [ ] Upload performs INIT, APPEND in 8 MB chunks, and FINALIZE against the v1.1 protocol layer.
- [ ] Optional processing polling supports video/gif success and failure cases.
- [ ] File-path helpers, if provided, are isolated from the runtime-neutral root export.
- [ ] Media upload errors map to `TwikitError`, including invalid media processing failures.
- [ ] Tests cover chunk boundaries, init/append/finalize ordering, polling success, polling failure, and tweet-create integration using returned media IDs.

## Blocked by

- .scratch/typescript-sdk-foundation/issues/03-request-transport-error-mapping.md
