import { notImplemented } from "../internal/not-implemented.js"

export type LoginChallenge = {
  type: string
  prompt?: string
}

export type LoginOptions = {
  username: string
  password: string
  email?: string
  onChallenge?: (challenge: LoginChallenge) => Promise<string>
}

export class AuthService {
  async login(_options: LoginOptions): Promise<void> {
    throw notImplemented("auth.login")
  }
}
