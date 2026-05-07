import { notImplemented } from "../internal/not-implemented.js"
import type { SessionStore, StoredCookie } from "../session/types.js"

export class SessionService {
  constructor(readonly store: SessionStore) {}

  async importCookieHeader(_cookieHeader: string): Promise<void> {
    throw notImplemented("session.importCookieHeader")
  }

  async importCookies(_cookies: StoredCookie[]): Promise<void> {
    throw notImplemented("session.importCookies")
  }

  async save(): Promise<void> {
    const snapshot = await this.store.load()
    await this.store.save(snapshot)
  }
}
