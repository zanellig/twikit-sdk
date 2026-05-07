import {
  buildCookieHeader,
  extractCsrf,
  mergeCookies,
  parseCookieHeader,
  parseSetCookie,
} from "../session/cookie-utils.js"
import type { SessionStore, StoredCookie } from "../session/types.js"

export class SessionService {
  constructor(readonly store: SessionStore) {}

  async importCookieHeader(cookieHeader: string): Promise<void> {
    const incoming = parseCookieHeader(cookieHeader)
    if (incoming.length === 0) return

    const snapshot = await this.store.load()
    snapshot.cookies = mergeCookies(snapshot.cookies, incoming)
    snapshot.updatedAt = new Date().toISOString()
    await this.store.save(snapshot)
  }

  async importCookies(cookies: StoredCookie[]): Promise<void> {
    if (cookies.length === 0) return

    const snapshot = await this.store.load()
    snapshot.cookies = mergeCookies(snapshot.cookies, cookies)
    snapshot.updatedAt = new Date().toISOString()
    await this.store.save(snapshot)
  }

  async save(): Promise<void> {
    const snapshot = await this.store.load()
    await this.store.save(snapshot)
  }

  /** @internal Extract CSRF token from the ct0 cookie. */
  async getCsrfToken(): Promise<string | undefined> {
    const snapshot = await this.store.load()
    return extractCsrf(snapshot.cookies)
  }

  /** @internal Build a Cookie request header string from stored cookies. */
  async getCookieHeader(): Promise<string> {
    const snapshot = await this.store.load()
    return buildCookieHeader(snapshot.cookies)
  }

  /** @internal Process Set-Cookie response headers and update the store. */
  async handleSetCookieHeaders(headers: string[]): Promise<void> {
    if (headers.length === 0) return

    const incoming: StoredCookie[] = []
    const removals: StoredCookie[] = []
    for (const header of headers) {
      const result = parseSetCookie(header)
      if (!result) continue
      if ("expired" in result) {
        removals.push(result.expired)
      } else {
        incoming.push(result.cookie)
      }
    }
    if (incoming.length === 0 && removals.length === 0) return

    const snapshot = await this.store.load()
    snapshot.cookies = mergeCookies(snapshot.cookies, incoming, removals)
    snapshot.updatedAt = new Date().toISOString()
    await this.store.save(snapshot)
  }
}
