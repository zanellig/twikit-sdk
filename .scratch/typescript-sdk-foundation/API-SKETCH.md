Status: ready-for-agent

# API Sketch: TypeScript Twikit SDK Foundation

This document captures the sample public interfaces agreed during planning. It is not a complete final API reference; it is the intended shape implementation agents should preserve unless a later decision updates the PRD.

## Package Shape

```ts
import { MemorySession, TwikitClient, isTwikitError } from "twikit-sdk"
import { FileSession } from "twikit-sdk/node"
```

The root export is runtime-neutral. Filesystem helpers live under the runtime-specific export.

## Client Construction

```ts
const client = new TwikitClient({
  language: "en-US",
  userAgent: "Mozilla/5.0 ...",
  session: new MemorySession(),
  fetch: globalThis.fetch,
})
```

`fetch` is optional and defaults to `globalThis.fetch`.

The package name is `twikit-sdk`. The SDK is ESM-only and does not provide a CommonJS entrypoint.

## Cookie Session MVP

```ts
const session = await FileSession.load("./session.json")

const client = new TwikitClient({ session })

await client.session.importCookieHeader(
  "auth_token=...; ct0=...; twid=..."
)

await client.session.importCookies([
  {
    name: "auth_token",
    value: "...",
    domain: ".x.com",
    path: "/",
    secure: true,
    httpOnly: true,
  },
])

await client.session.save()
```

Session files contain live auth cookies and should be treated as secrets. They must not be committed. File-backed storage should use restrictive file permissions where supported by the runtime.

Credential login is not implemented in the MVP, but the future shape should remain callback-based and non-interactive:

```ts
await client.auth.login({
  username,
  password,
  onChallenge: async (challenge) => {
    return getCodeFromApplicationUI(challenge)
  },
})
```

The SDK must not call `prompt()`, read stdin, print to console, or assume a CLI.

## Domain Services

Domain behavior lives on services. Returned domain objects are passive DTOs.

```ts
const user = await client.users.getByUsername("example_user")

const tweets = await client.tweets.listByUser(user.id, {
  type: "tweets",
  limit: 20,
})

for (const tweet of tweets.items) {
  console.log(tweet.author?.name, tweet.text)
}

const nextPage = await tweets.next()

await client.tweets.like(tweet.id)
await client.tweets.reply(tweet.id, { text: "hi" })
await client.users.follow(user.id)
```

The SDK should not make `Tweet` or `User` instances active records with hidden client references.

## Pagination

```ts
const page = await client.search.tweets("typescript", {
  product: "latest",
  limit: 20,
})

page.items
page.nextCursor
page.previousCursor

const next = await page.next()
const previous = await page.previous()
```

`Page<T>` can be active because it represents a request continuation. Domain items inside the page remain passive.

## DTO Raw Fragments

```ts
type User = {
  id: string
  username: string
  name: string
  description: string
  metrics: {
    followers: number
    following: number
    tweets: number
  }
  verified: boolean
  blueVerified: boolean
  raw: unknown
}

type Tweet = {
  id: string
  text: string
  author?: User
  raw: unknown
}
```

`raw` contains only the upstream source fragment used to build that DTO, not the entire operation response.

## Media Upload

```ts
const mediaId = await client.media.upload(blob, {
  mediaType: "image/jpeg",
})

await client.tweets.create({
  text: "hello",
  mediaIds: [mediaId],
})
```

Media upload uses the v1.1 INIT/APPEND/FINALIZE flow internally, with optional processing polling for video and gif media.

## Error Handling

The SDK throws by default.

```ts
try {
  await client.tweets.create({ text: "hello" })
} catch (error) {
  if (isTwikitError(error, "rate_limited")) {
    // back off
  }
}
```

The public error shape is broad and stable:

```ts
type TwikitErrorKind =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "account_locked"
  | "account_suspended"
  | "schema"
  | "network"
  | "server"
  | "unknown"

class TwikitError extends Error {
  kind: TwikitErrorKind
  status?: number
  code?: number | string
  operation?: string
  headers?: Headers
  raw?: unknown
  rateLimit?: {
    resetAt?: Date
    resetEpochSeconds?: number
  }
}
```

`operation` is a public domain operation label such as `users.getByUsername`, not an internal GraphQL query ID or path.

## Internal Operation Registry

The registry stays internal for MVP. Domain services call it; consumers do not.

```ts
const operations = {
  UserByScreenName: {
    method: "GET",
    path: "NimuplG1OB7Fd2btCLdBOw/UserByScreenName",
    features: userFeatures,
    variables: userByScreenNameVariables,
    response: userByScreenNameResponse,
    operation: "users.getByUsername",
  },
} as const
```

Valibot schemas validate operation variables and the response fragments consumed by mappers. Unknown extra fields are tolerated; missing consumed fields throw `TwikitError` with `kind: "schema"`.

Operation IDs live in the internal registry. When X changes an operation ID, maintainers update the registry entry, refresh the relevant fixture, and document the change.
