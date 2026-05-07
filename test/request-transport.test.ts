import { describe, expect, it, vi } from "vitest"

import { TwikitError, isTwikitError } from "../src/errors.js"
import { MemorySession } from "../src/session/memory-session.js"
import { SessionService } from "../src/services/session-service.js"
import { RequestTransport } from "../src/internal/request-transport.js"

describe("RequestTransport", () => {
  function createTransport(options: {
    cookies?: string
    language?: string
    userAgent?: string
  } = {}) {
    const fetchMock = vi.fn<typeof globalThis.fetch>()
    const session = new MemorySession()
    const sessionService = new SessionService(session)
    const transport = new RequestTransport({
      fetch: fetchMock,
      session: sessionService,
      ...(options.language != null && { language: options.language }),
      ...(options.userAgent != null && { userAgent: options.userAgent }),
    })
    return { transport, fetchMock, sessionService }
  }

  describe("authenticated headers", () => {
    it("includes bearer token, auth type, active user, referer, and content-type", async () => {
      const { transport, fetchMock, sessionService } = createTransport()

      await sessionService.importCookieHeader("auth_token=tok; ct0=csrf123")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/i/api/graphql/abc/UserByScreenName",
        operation: "users.getByUsername",
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      const [, init] = fetchMock.mock.calls[0]!
      const headers = new Headers(init?.headers as HeadersInit)

      expect(headers.get("authorization")).toMatch(/^Bearer /)
      expect(headers.get("x-twitter-auth-type")).toBe("OAuth2Session")
      expect(headers.get("x-twitter-active-user")).toBe("yes")
      expect(headers.get("referer")).toBe("https://x.com/")
      expect(headers.get("content-type")).toBe("application/json")
    })

    it("includes CSRF token derived from ct0 cookie", async () => {
      const { transport, fetchMock, sessionService } = createTransport()

      await sessionService.importCookieHeader("auth_token=tok; ct0=my_csrf")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/i/api/graphql/abc/UserByScreenName",
        operation: "users.getByUsername",
      })

      const [, init] = fetchMock.mock.calls[0]!
      const headers = new Headers(init?.headers as HeadersInit)
      expect(headers.get("x-csrf-token")).toBe("my_csrf")
    })

    it("includes cookie header from session store", async () => {
      const { transport, fetchMock, sessionService } = createTransport()

      await sessionService.importCookieHeader("auth_token=tok; ct0=csrf")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/i/api/graphql/abc/Test",
        operation: "test.op",
      })

      const [, init] = fetchMock.mock.calls[0]!
      const headers = new Headers(init?.headers as HeadersInit)
      expect(headers.get("cookie")).toBe("auth_token=tok; ct0=csrf")
    })

    it("includes language headers when configured", async () => {
      const { transport, fetchMock, sessionService } = createTransport({
        language: "en-US",
      })

      await sessionService.importCookieHeader("ct0=csrf")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/i/api/graphql/abc/Test",
        operation: "test.op",
      })

      const [, init] = fetchMock.mock.calls[0]!
      const headers = new Headers(init?.headers as HeadersInit)
      expect(headers.get("accept-language")).toBe("en-US")
      expect(headers.get("x-twitter-client-language")).toBe("en-US")
    })

    it("includes user-agent when configured", async () => {
      const { transport, fetchMock, sessionService } = createTransport({
        userAgent: "Mozilla/5.0 Test",
      })

      await sessionService.importCookieHeader("ct0=csrf")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/i/api/graphql/abc/Test",
        operation: "test.op",
      })

      const [, init] = fetchMock.mock.calls[0]!
      const headers = new Headers(init?.headers as HeadersInit)
      expect(headers.get("user-agent")).toBe("Mozilla/5.0 Test")
    })

    it("omits language headers when not configured", async () => {
      const { transport, fetchMock, sessionService } = createTransport()

      await sessionService.importCookieHeader("ct0=csrf")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/i/api/graphql/abc/Test",
        operation: "test.op",
      })

      const [, init] = fetchMock.mock.calls[0]!
      const headers = new Headers(init?.headers as HeadersInit)
      expect(headers.has("accept-language")).toBe(false)
      expect(headers.has("x-twitter-client-language")).toBe(false)
    })
  })

  describe("HTTP status mapping", () => {
    it("maps 400 to bad_request", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "bad" }] }), { status: 400 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "bad_request")).toBe(true)
      expect(error.status).toBe(400)
    })

    it("maps 401 to unauthorized", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "auth" }] }), { status: 401 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "unauthorized")).toBe(true)
      expect(error.status).toBe(401)
    })

    it("maps 403 to forbidden", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "no" }] }), { status: 403 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "forbidden")).toBe(true)
      expect(error.status).toBe(403)
    })

    it("maps 404 to not_found", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "gone" }] }), { status: 404 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "not_found")).toBe(true)
      expect(error.status).toBe(404)
    })

    it("maps 429 to rate_limited", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "slow" }] }), { status: 429 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "rate_limited")).toBe(true)
      expect(error.status).toBe(429)
    })

    it("maps 5xx to server", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "oops" }] }), { status: 502 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "server")).toBe(true)
      expect(error.status).toBe(502)
    })

    it("maps other 4xx to unknown", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "timeout" }] }), { status: 408 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error)).toBe(true)
      expect(error.kind).toBe("unknown")
      expect(error.status).toBe(408)
    })
  })

  describe("429 rate-limit parsing", () => {
    it("parses x-rate-limit-reset into rateLimit metadata", async () => {
      const { transport, fetchMock } = createTransport()
      const resetEpoch = 1700000000
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "slow" }] }), {
          status: 429,
          headers: { "x-rate-limit-reset": String(resetEpoch) },
        }),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(error.rateLimit).toBeDefined()
      expect(error.rateLimit!.resetEpochSeconds).toBe(resetEpoch)
      expect(error.rateLimit!.resetAt).toBeInstanceOf(Date)
      expect(error.rateLimit!.resetAt!.getTime()).toBe(resetEpoch * 1000)
    })

    it("omits rateLimit when x-rate-limit-reset header is absent", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "slow" }] }), { status: 429 }),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(error.rateLimit).toBeUndefined()
    })
  })

  describe("GraphQL error envelope mapping", () => {
    it("maps error code 37 to account_suspended", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 37, message: "User has been suspended." }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "account_suspended")).toBe(true)
      expect(error.code).toBe(37)
    })

    it("maps error code 64 to account_suspended", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 64, message: "Your account is suspended." }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "account_suspended")).toBe(true)
      expect(error.code).toBe(64)
    })

    it("maps error code 326 to account_locked", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 326, message: "Account locked." }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "account_locked")).toBe(true)
      expect(error.code).toBe(326)
    })

    it("maps error code 187 (duplicate tweet) to bad_request with code", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 187, message: "Status is a duplicate." }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "POST", url: "https://x.com/test", operation: "tweets.create" })
        .catch((e) => e)

      expect(isTwikitError(error, "bad_request")).toBe(true)
      expect(error.code).toBe(187)
      expect(error.message).toBe("Status is a duplicate.")
    })

    it("maps error code 324 (invalid media) to bad_request with code", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 324, message: "Invalid media." }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "POST", url: "https://x.com/test", operation: "tweets.create" })
        .catch((e) => e)

      expect(isTwikitError(error, "bad_request")).toBe(true)
      expect(error.code).toBe(324)
    })

    it("maps unknown error codes in 200 responses to unknown kind", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 999, message: "Something weird." }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "unknown")).toBe(true)
      expect(error.code).toBe(999)
    })

    it("finds a known code in a later errors entry when the first lacks a numeric code", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errors: [
              { message: "Something generic" },
              { code: 326, message: "Account locked." },
            ],
          }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "account_locked")).toBe(true)
      expect(error.code).toBe(326)
    })

    it("falls back to extensions.code when top-level code is absent", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errors: [
              { message: "Duplicate tweet.", extensions: { code: 187 } },
            ],
          }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "POST", url: "https://x.com/test", operation: "tweets.create" })
        .catch((e) => e)

      expect(isTwikitError(error, "bad_request")).toBe(true)
      expect(error.code).toBe(187)
      expect(error.message).toBe("Duplicate tweet.")
    })
  })

  describe("operation labels and metadata", () => {
    it("carries the domain operation label on HTTP errors", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "nope" }] }), { status: 403 }),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "users.getByUsername" })
        .catch((e) => e)

      expect(error.operation).toBe("users.getByUsername")
    })

    it("carries the domain operation label on GraphQL errors", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 37, message: "suspended" }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/i/api/graphql/abc/Test", operation: "search.tweets" })
        .catch((e) => e)

      expect(error.operation).toBe("search.tweets")
    })

    it("preserves raw response body on errors", async () => {
      const { transport, fetchMock } = createTransport()
      const body = { errors: [{ message: "bad stuff", code: 403 }], extra: "data" }
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(body), { status: 200 }),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(error.raw).toEqual(body)
    })

    it("preserves response headers on errors", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ errors: [{ message: "no" }] }), {
          status: 401,
          headers: { "x-custom": "value" },
        }),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(error.headers).toBeInstanceOf(Headers)
      expect(error.headers!.get("x-custom")).toBe("value")
    })
  })

  describe("network errors", () => {
    it("wraps fetch TypeError into TwikitError with kind network", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"))

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "network")).toBe(true)
      expect(error.message).toBe("Failed to fetch")
      expect(error.operation).toBe("test.op")
      expect(error.cause).toBeInstanceOf(TypeError)
    })

    it("wraps non-TypeError fetch failures into TwikitError with kind network", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockRejectedValueOnce(new Error("DNS resolution failed"))

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "network")).toBe(true)
      expect(error.operation).toBe("test.op")
    })
  })

  describe("Set-Cookie persistence", () => {
    it("persists Set-Cookie response headers back to the session store", async () => {
      const { transport, fetchMock, sessionService } = createTransport()

      await sessionService.importCookieHeader("auth_token=tok; ct0=old_csrf")

      const responseHeaders = new Headers()
      responseHeaders.append("set-cookie", "ct0=refreshed_csrf; Domain=.x.com; Path=/; Secure; HttpOnly")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), {
          status: 200,
          headers: responseHeaders,
        }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/test",
        operation: "test.op",
      })

      const csrf = await sessionService.getCsrfToken()
      expect(csrf).toBe("refreshed_csrf")
    })

    it("does not fail when no Set-Cookie headers are present", async () => {
      const { transport, fetchMock, sessionService } = createTransport()

      await sessionService.importCookieHeader("ct0=original")

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
      )

      await transport.execute({
        method: "GET",
        url: "https://x.com/test",
        operation: "test.op",
      })

      const csrf = await sessionService.getCsrfToken()
      expect(csrf).toBe("original")
    })
  })

  describe("non-JSON response bodies", () => {
    it("maps a 500 HTML response to TwikitError instead of SyntaxError", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response("<html>Internal Server Error</html>", {
          status: 500,
          headers: { "content-type": "text/html" },
        }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "server")).toBe(true)
      expect(error.status).toBe(500)
      expect(error.operation).toBe("test.op")
    })

    it("maps an empty 401 body to TwikitError", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response("", { status: 401 }),
      )

      const error = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "unauthorized")).toBe(true)
      expect(error.status).toBe(401)
    })

    it("preserves the raw text body when JSON parsing fails", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response("Not JSON at all", { status: 502 }),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "server")).toBe(true)
      expect(error.raw).toBe("Not JSON at all")
    })
  })

  describe("HTTP status vs GraphQL envelope precedence", () => {
    it("uses HTTP status mapping for 429 even when GraphQL errors are present", async () => {
      const { transport, fetchMock } = createTransport()
      const resetEpoch = 1700000000
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 37, message: "suspended" }] }),
          {
            status: 429,
            headers: { "x-rate-limit-reset": String(resetEpoch) },
          },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "rate_limited")).toBe(true)
      expect(error.status).toBe(429)
      expect(error.rateLimit).toBeDefined()
      expect(error.rateLimit!.resetEpochSeconds).toBe(resetEpoch)
    })

    it("uses HTTP status mapping for 401 even when GraphQL errors are present", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 64, message: "suspended" }] }),
          { status: 401 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "unauthorized")).toBe(true)
      expect(error.status).toBe(401)
    })

    it("still maps GraphQL error envelopes on 200 responses", async () => {
      const { transport, fetchMock } = createTransport()
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ code: 37, message: "suspended" }] }),
          { status: 200 },
        ),
      )

      const error: TwikitError = await transport
        .execute({ method: "GET", url: "https://x.com/test", operation: "test.op" })
        .catch((e) => e)

      expect(isTwikitError(error, "account_suspended")).toBe(true)
      expect(error.code).toBe(37)
    })
  })
})
