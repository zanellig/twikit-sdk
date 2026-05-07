export type TwikitErrorKind =
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

export type TwikitErrorOptions = {
  kind: TwikitErrorKind
  message: string
  status?: number
  code?: number | string
  operation?: string
  headers?: Headers
  raw?: unknown
  rateLimit?: {
    resetAt?: Date
    resetEpochSeconds?: number
  }
  cause?: unknown
}

export class TwikitError extends Error {
  readonly kind: TwikitErrorKind
  readonly status: number | undefined
  readonly code: number | string | undefined
  readonly operation: string | undefined
  readonly headers: Headers | undefined
  readonly raw?: unknown
  readonly rateLimit:
    | {
        resetAt?: Date
        resetEpochSeconds?: number
      }
    | undefined

  constructor(options: TwikitErrorOptions) {
    super(options.message, { cause: options.cause })
    this.name = "TwikitError"
    this.kind = options.kind
    this.status = options.status
    this.code = options.code
    this.operation = options.operation
    this.headers = options.headers
    this.raw = options.raw
    this.rateLimit = options.rateLimit
  }
}

export function isTwikitError(
  error: unknown,
  kind?: TwikitErrorKind,
): error is TwikitError {
  return error instanceof TwikitError && (kind === undefined || error.kind === kind)
}
