import { TwikitError } from "./errors.js"
import { AuthService } from "./services/auth-service.js"
import { MediaService } from "./services/media-service.js"
import { SearchService } from "./services/search-service.js"
import { SessionService } from "./services/session-service.js"
import { TweetsService } from "./services/tweets-service.js"
import { UsersService } from "./services/users-service.js"
import { MemorySession } from "./session/memory-session.js"
import type { SessionStore } from "./session/types.js"
import type { FetchAdapter } from "./types.js"

export type TwikitClientOptions = {
  language?: string
  userAgent?: string
  session?: SessionStore
  fetch?: FetchAdapter
}

export class TwikitClient {
  readonly language: string | undefined
  readonly userAgent: string | undefined
  readonly fetch: FetchAdapter
  readonly session: SessionService
  readonly users: UsersService
  readonly tweets: TweetsService
  readonly search: SearchService
  readonly media: MediaService
  readonly auth: AuthService

  constructor(options: TwikitClientOptions = {}) {
    this.language = options.language
    this.userAgent = options.userAgent
    this.fetch = options.fetch ?? globalThis.fetch

    if (typeof this.fetch !== "function") {
      throw new TwikitError({
        kind: "unknown",
        message: "TwikitClient requires a fetch implementation.",
      })
    }

    const sessionStore = options.session ?? new MemorySession()
    this.session = new SessionService(sessionStore)
    this.users = new UsersService()
    this.tweets = new TweetsService()
    this.search = new SearchService()
    this.media = new MediaService()
    this.auth = new AuthService()
  }
}
