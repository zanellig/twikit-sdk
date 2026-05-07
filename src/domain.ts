export type User = {
  id: string
  username: string
  name: string
  description: string
  metrics: {
    followers: number
    following: number
    tweets: number
  }
  verified: boolean
  blueVerified: boolean
  raw: unknown
}

export type Tweet = {
  id: string
  text: string
  author?: User
  raw: unknown
}
