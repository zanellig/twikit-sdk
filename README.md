# twikit-sdk

Clean-room TypeScript SDK foundation inspired by Python [`d60/twikit`](https://github.com/d60/twikit). Python twikit is a behavioral reference for protocol behavior; this package does not depend on Python and does not copy Python source.

This SDK targets Node.js 20+ and Bun 1.1+ with ESM-only packaging. The root export is runtime-neutral, and filesystem helpers live under the runtime-specific helper entrypoint.

```ts
import { MemorySession, TwikitClient, isTwikitError } from "twikit-sdk"
import { FileSession } from "twikit-sdk/node"
```

```ts
const session = await FileSession.load("./session.json")

const client = new TwikitClient({
  language: "en-US",
  userAgent: "Mozilla/5.0 ...",
  session,
  fetch: globalThis.fetch,
})
```

## Current Scope

This package is currently a foundation scaffold. It exposes the public client shell, service namespaces, runtime-neutral session types, `MemorySession`, `FileSession`, passive DTO contracts, and typed SDK errors. Network behavior, cookie parsing, request transport, operation registry execution, media upload orchestration, and transaction headers are implemented by later slices.

Session files contain live auth cookies and must be treated as secrets. Do not commit them.
