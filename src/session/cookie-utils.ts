import { Cookie } from "tough-cookie"

import type { StoredCookie } from "./types.js"

const DEFAULT_DOMAIN = ".x.com"
const DEFAULT_PATH = "/"

/**
 * Parse a browser-style Cookie request header (`name=value; name2=value2`)
 * into StoredCookie objects. Each pair is parsed through tough-cookie, then
 * given sensible defaults for domain, path, secure, and httpOnly since the
 * Cookie header format does not carry those attributes.
 *
 * @internal
 */
export function parseCookieHeader(header: string): StoredCookie[] {
  if (!header.trim()) return []

  const cookies: StoredCookie[] = []
  for (const pair of header.split(";")) {
    const trimmed = pair.trim()
    if (!trimmed) continue

    const cookie = Cookie.parse(trimmed)
    if (!cookie) continue

    cookies.push({
      name: cookie.key,
      value: cookie.value,
      domain: DEFAULT_DOMAIN,
      path: DEFAULT_PATH,
      secure: true,
      httpOnly: true,
    })
  }
  return cookies
}

/**
 * Parse a Set-Cookie response header using tough-cookie.
 * Returns `"expired"` when the header is a deletion directive
 * (Max-Age=0 or past Expires), so the caller can remove the cookie.
 *
 * @internal
 */
export function parseSetCookie(
  header: string,
): { cookie: StoredCookie } | { expired: StoredCookie } | null {
  const cookie = Cookie.parse(header)
  if (!cookie) return null

  const stored = toughCookieToStored(cookie)
  if (cookie.TTL() <= 0) {
    return { expired: stored }
  }
  return { cookie: stored }
}

function toughCookieToStored(cookie: Cookie): StoredCookie {
  const stored: StoredCookie = {
    name: cookie.key,
    value: cookie.value,
  }

  if (cookie.domain) {
    stored.domain = cookie.domain.startsWith(".")
      ? cookie.domain
      : `.${cookie.domain}`
  }
  if (cookie.path) {
    stored.path = cookie.path
  }
  if (cookie.secure) {
    stored.secure = true
  }
  if (cookie.httpOnly) {
    stored.httpOnly = true
  }
  if (cookie.expires instanceof Date) {
    stored.expires = cookie.expires.toISOString()
  }
  if (cookie.sameSite != null) {
    const lower = cookie.sameSite.toLowerCase()
    if (lower === "strict" || lower === "lax" || lower === "none") {
      stored.sameSite = lower
    }
  }

  return stored
}

/**
 * Merge incoming cookies into an existing cookie list, replacing by
 * name + domain + path. Cookies in `removals` are deleted from the
 * result. After merging, deduplicate ct0 cookies.
 *
 * @internal
 */
export function mergeCookies(
  existing: StoredCookie[],
  incoming: StoredCookie[],
  removals: StoredCookie[] = [],
): StoredCookie[] {
  const map = new Map<string, StoredCookie>()
  for (const c of existing) {
    map.set(cookieKey(c), c)
  }
  for (const c of incoming) {
    map.set(cookieKey(c), c)
  }
  for (const c of removals) {
    map.delete(cookieKey(c))
  }
  return deduplicateCt0([...map.values()])
}

function cookieKey(cookie: StoredCookie): string {
  return `${cookie.name}|${cookie.domain ?? ""}|${cookie.path ?? "/"}`
}

/**
 * Deduplicate ct0 cookies, keeping only the first occurrence and
 * discarding later ones. Compatible with Python twikit's
 * `_remove_duplicate_ct0_cookie` behavior.
 *
 * @internal
 */
export function deduplicateCt0(cookies: StoredCookie[]): StoredCookie[] {
  let seenCt0 = false
  const result: StoredCookie[] = []
  for (const cookie of cookies) {
    if (cookie.name === "ct0") {
      if (seenCt0) continue
      seenCt0 = true
    }
    result.push(cookie)
  }
  return result
}

/**
 * Extract the CSRF token value from the ct0 cookie.
 *
 * @internal
 */
export function extractCsrf(cookies: StoredCookie[]): string | undefined {
  for (const cookie of cookies) {
    if (cookie.name === "ct0") {
      return cookie.value
    }
  }
  return undefined
}

/**
 * Build a Cookie request header string from stored cookies,
 * skipping any cookies whose `expires` timestamp is in the past.
 *
 * @internal
 */
export function buildCookieHeader(cookies: StoredCookie[]): string {
  const now = Date.now()
  return cookies
    .filter((c) => !c.expires || new Date(c.expires).getTime() > now)
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")
}
