import type { User } from "../domain.js"
import { notImplemented } from "../internal/not-implemented.js"

export class UsersService {
  async getByUsername(_username: string): Promise<User> {
    throw notImplemented("users.getByUsername")
  }

  async getById(_id: string): Promise<User> {
    throw notImplemented("users.getById")
  }

  async follow(_userId: string): Promise<void> {
    throw notImplemented("users.follow")
  }
}
