export type SessionSnapshot = {
  cookies: StoredCookie[]
  userId?: string
  createdAt?: string
  updatedAt?: string
}

export type StoredCookie = {
  name: string
  value: string
  domain?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  expires?: string
  sameSite?: "strict" | "lax" | "none"
}

export interface SessionStore {
  load(): Promise<SessionSnapshot>
  save(snapshot: SessionSnapshot): Promise<void>
}
