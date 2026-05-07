import { describe, expect, expectTypeOf, it, vi } from "vitest"

import {
  MemorySession,
  TwikitClient,
  TwikitError,
  type Page,
  type Tweet,
  type User,
  isTwikitError,
} from "../src/index.js"
import { FileSession } from "../src/node.js"

describe("public API contract", () => {
  it("constructs a runtime-neutral client with the sketched options", () => {
    const fetch = vi.fn<typeof globalThis.fetch>()
    const session = new MemorySession()
    const client = new TwikitClient({
      language: "en-US",
      userAgent: "Mozilla/5.0",
      session,
      fetch,
    })

    expect(client.language).toBe("en-US")
    expect(client.userAgent).toBe("Mozilla/5.0")
    expect(client.fetch).toBe(fetch)
    expect(client.session.store).toBe(session)
  })

  it("exposes service namespaces", () => {
    const client = new TwikitClient()

    expect(client.session).toBeDefined()
    expect(client.users).toBeDefined()
    expect(client.tweets).toBeDefined()
    expect(client.search).toBeDefined()
    expect(client.media).toBeDefined()
    expect(client.auth).toBeDefined()
  })

  it("keeps DTOs passive and pages active in the type contract", () => {
    expectTypeOf<User>().toMatchTypeOf<{
      id: string
      username: string
      name: string
      description: string
      metrics: { followers: number; following: number; tweets: number }
      verified: boolean
      blueVerified: boolean
      raw: unknown
    }>()

    expectTypeOf<Tweet>().toMatchTypeOf<{
      id: string
      text: string
      author?: User
      raw: unknown
    }>()

    expectTypeOf<Page<Tweet>>().toMatchTypeOf<{
      items: Tweet[]
      nextCursor?: string
      previousCursor?: string
      next(): Promise<Page<Tweet>>
      previous(): Promise<Page<Tweet>>
    }>()
  })

  it("matches sketched domain method calls at compile time", async () => {
    const client = new TwikitClient({ session: new MemorySession() })

    if (false) {
      expectTypeOf(client.users.getByUsername("example_user")).toEqualTypeOf<Promise<User>>()
      expectTypeOf(client.tweets.listByUser("123", { type: "tweets", limit: 20 })).toEqualTypeOf<
        Promise<Page<Tweet>>
      >()
      expectTypeOf(client.search.tweets("typescript", { product: "latest" })).toEqualTypeOf<
        Promise<Page<Tweet>>
      >()
      expectTypeOf(client.media.upload(new Blob(), { mediaType: "image/jpeg" })).toEqualTypeOf<
        Promise<string>
      >()
      expectTypeOf(client.tweets.create({ text: "hello", mediaIds: ["1"] })).toEqualTypeOf<
        Promise<Tweet>
      >()
      expectTypeOf(client.tweets.like("1")).toEqualTypeOf<Promise<void>>()
    }

    await expect(client.tweets.like("1")).rejects.toMatchObject({
      operation: "tweets.like",
    })
  })

  it("exports the runtime-specific FileSession from the node entrypoint", async () => {
    expectTypeOf(FileSession.load("./session.json")).toEqualTypeOf<Promise<FileSession>>()
  })

  it("narrows TwikitError by kind", () => {
    const error = new TwikitError({ kind: "rate_limited", message: "slow down" })

    expect(isTwikitError(error, "rate_limited")).toBe(true)
    expect(isTwikitError(error, "not_found")).toBe(false)
  })
})
