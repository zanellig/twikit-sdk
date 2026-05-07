import { TwikitError } from "../errors.js"
import type { TwikitErrorKind } from "../errors.js"
import type { SessionService } from "../services/session-service.js"
import type { FetchAdapter } from "../types.js"

const BEARER_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA"

export type RequestOptions = {
  method: string
  url: string
  operation: string
  body?: unknown
}

export type RequestTransportConfig = {
  fetch: FetchAdapter
  session: SessionService
  language?: string
  userAgent?: string
}

export class RequestTransport {
  readonly #fetch: FetchAdapter
  readonly #session: SessionService
  readonly #language: string | undefined
  readonly #userAgent: string | undefined

  constructor(config: RequestTransportConfig) {
    this.#fetch = config.fetch
    this.#session = config.session
    this.#language = config.language
    this.#userAgent = config.userAgent
  }

  async execute(options: RequestOptions): Promise<{ data: unknown; response: Response }> {
    const headers = await this.#buildHeaders()

    const fetchInit: RequestInit = {
      method: options.method,
      headers,
    }

    if (options.body !== undefined) {
      fetchInit.body = JSON.stringify(options.body)
    }

    let response: Response
    try {
      response = await this.#fetch(options.url, fetchInit)
    } catch (cause) {
      throw new TwikitError({
        kind: "network",
        message: cause instanceof Error ? cause.message : "Network request failed",
        operation: options.operation,
        cause,
      })
    }

    await this.#persistSetCookies(response)

    const data = await parseResponseBody(response)

    if (response.status >= 400) {
      throw this.#mapHttpError(response, data, options.operation)
    }

    const gqlError = extractGraphQLError(data)
    if (gqlError) {
      throw this.#mapGraphQLError(response, data, gqlError, options.operation)
    }

    return { data, response }
  }

  #mapGraphQLError(
    response: Response,
    data: unknown,
    gqlError: { code: number; message: string },
    operation: string,
  ): TwikitError {
    const kind = graphQLCodeToKind(gqlError.code)
    return new TwikitError({
      kind,
      message: gqlError.message,
      status: response.status,
      code: gqlError.code,
      operation,
      headers: response.headers,
      raw: data,
    })
  }

  #mapHttpError(response: Response, data: unknown, operation: string): TwikitError {
    const status = response.status
    const kind = httpStatusToKind(status)
    const message = extractMessage(data) ?? `HTTP ${status}`
    const rateLimit = status === 429 ? parseRateLimit(response.headers) : undefined

    const opts: import("../errors.js").TwikitErrorOptions = {
      kind,
      message,
      status,
      operation,
      headers: response.headers,
      raw: data,
    }
    if (rateLimit) opts.rateLimit = rateLimit
    return new TwikitError(opts)
  }

  async #persistSetCookies(response: Response): Promise<void> {
    const setCookieHeaders = response.headers.getSetCookie?.() ?? []
    if (setCookieHeaders.length > 0) {
      await this.#session.handleSetCookieHeaders(setCookieHeaders)
    }
  }

  async #buildHeaders(): Promise<Headers> {
    const headers = new Headers()

    headers.set("authorization", `Bearer ${BEARER_TOKEN}`)
    headers.set("content-type", "application/json")
    headers.set("x-twitter-auth-type", "OAuth2Session")
    headers.set("x-twitter-active-user", "yes")
    headers.set("referer", "https://x.com/")

    if (this.#userAgent) {
      headers.set("user-agent", this.#userAgent)
    }

    if (this.#language) {
      headers.set("accept-language", this.#language)
      headers.set("x-twitter-client-language", this.#language)
    }

    const csrf = await this.#session.getCsrfToken()
    if (csrf) {
      headers.set("x-csrf-token", csrf)
    }

    const cookieHeader = await this.#session.getCookieHeader()
    if (cookieHeader) {
      headers.set("cookie", cookieHeader)
    }

    return headers
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function httpStatusToKind(status: number): TwikitErrorKind {
  switch (status) {
    case 400: return "bad_request"
    case 401: return "unauthorized"
    case 403: return "forbidden"
    case 404: return "not_found"
    case 429: return "rate_limited"
    default:
      if (status >= 500) return "server"
      return "unknown"
  }
}

type GraphQLError = { code: number; message: string }

function extractGraphQLError(data: unknown): GraphQLError | undefined {
  if (
    typeof data !== "object" ||
    data === null ||
    !("errors" in data) ||
    !Array.isArray((data as { errors: unknown }).errors)
  ) {
    return undefined
  }
  const errors = (data as { errors: Record<string, unknown>[] }).errors
  for (const entry of errors) {
    const code = typeof entry.code === "number"
      ? entry.code
      : typeof (entry.extensions as Record<string, unknown> | undefined)?.code === "number"
        ? (entry.extensions as Record<string, unknown>).code as number
        : undefined
    if (code !== undefined) {
      const message = typeof entry.message === "string" ? entry.message : `Error code ${code}`
      return { code, message }
    }
  }
  return undefined
}

function graphQLCodeToKind(code: number): TwikitErrorKind {
  switch (code) {
    case 37:
    case 64:
      return "account_suspended"
    case 326:
      return "account_locked"
    case 187:
    case 324:
      return "bad_request"
    default:
      return "unknown"
  }
}

function parseRateLimit(
  headers: Headers,
): { resetAt: Date; resetEpochSeconds: number } | undefined {
  const raw = headers.get("x-rate-limit-reset")
  if (!raw) return undefined
  const epoch = parseInt(raw, 10)
  if (Number.isNaN(epoch)) return undefined
  return {
    resetEpochSeconds: epoch,
    resetAt: new Date(epoch * 1000),
  }
}

function extractMessage(data: unknown): string | undefined {
  if (
    typeof data === "object" &&
    data !== null &&
    "errors" in data &&
    Array.isArray((data as { errors: unknown }).errors)
  ) {
    const errors = (data as { errors: { message?: string }[] }).errors
    if (errors.length > 0 && typeof errors[0]!.message === "string") {
      return errors[0]!.message
    }
  }
  return undefined
}
