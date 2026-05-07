import type { Tweet } from "../domain.js"
import { notImplemented } from "../internal/not-implemented.js"
import type { Page } from "../pagination.js"

export type SearchTweetsOptions = {
  product?: "top" | "latest" | "media"
  limit?: number
  cursor?: string
}

export class SearchService {
  async tweets(_query: string, _options: SearchTweetsOptions = {}): Promise<Page<Tweet>> {
    throw notImplemented("search.tweets")
  }
}
