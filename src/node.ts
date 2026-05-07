import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

import type { SessionSnapshot, SessionStore } from "./session/types.js"

export class FileSession implements SessionStore {
  readonly path: string
  #snapshot: SessionSnapshot

  private constructor(path: string, snapshot: SessionSnapshot) {
    this.path = path
    this.#snapshot = structuredClone(snapshot)
  }

  static async load(path: string): Promise<FileSession> {
    try {
      const raw = await readFile(path, "utf8")
      const parsed = JSON.parse(raw) as SessionSnapshot
      return new FileSession(path, normalizeSnapshot(parsed))
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return new FileSession(path, { cookies: [] })
      }

      throw error
    }
  }

  async load(): Promise<SessionSnapshot> {
    return structuredClone(this.#snapshot)
  }

  async save(snapshot: SessionSnapshot = this.#snapshot): Promise<void> {
    this.#snapshot = normalizeSnapshot(snapshot)
    await mkdir(dirname(this.path), { recursive: true })
    await writeFile(this.path, `${JSON.stringify(this.#snapshot, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    })
  }
}

function normalizeSnapshot(snapshot: SessionSnapshot): SessionSnapshot {
  return {
    ...snapshot,
    cookies: Array.isArray(snapshot.cookies) ? snapshot.cookies : [],
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error
}
