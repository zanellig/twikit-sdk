import type { Tweet } from "../domain.js"
import { notImplemented } from "../internal/not-implemented.js"
import type { Page } from "../pagination.js"

export type ListTweetsOptions = {
  type?: "tweets" | "replies" | "media" | "likes"
  limit?: number
  cursor?: string
}

export type CreateTweetInput = {
  text: string
  mediaIds?: string[]
}

export class TweetsService {
  async getById(_id: string): Promise<Tweet> {
    throw notImplemented("tweets.getById")
  }

  async listByUser(_userId: string, _options: ListTweetsOptions = {}): Promise<Page<Tweet>> {
    throw notImplemented("tweets.listByUser")
  }

  async create(_input: CreateTweetInput): Promise<Tweet> {
    throw notImplemented("tweets.create")
  }

  async reply(_tweetId: string, _input: CreateTweetInput): Promise<Tweet> {
    throw notImplemented("tweets.reply")
  }

  async delete(_tweetId: string): Promise<void> {
    throw notImplemented("tweets.delete")
  }

  async like(_tweetId: string): Promise<void> {
    throw notImplemented("tweets.like")
  }

  async unlike(_tweetId: string): Promise<void> {
    throw notImplemented("tweets.unlike")
  }

  async retweet(_tweetId: string): Promise<void> {
    throw notImplemented("tweets.retweet")
  }

  async unretweet(_tweetId: string): Promise<void> {
    throw notImplemented("tweets.unretweet")
  }

  async bookmark(_tweetId: string): Promise<void> {
    throw notImplemented("tweets.bookmark")
  }

  async unbookmark(_tweetId: string): Promise<void> {
    throw notImplemented("tweets.unbookmark")
  }
}
