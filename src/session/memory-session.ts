import type { SessionSnapshot, SessionStore } from "./types.js"

export class MemorySession implements SessionStore {
  #snapshot: SessionSnapshot

  constructor(snapshot: SessionSnapshot = { cookies: [] }) {
    this.#snapshot = cloneSnapshot(snapshot)
  }

  async load(): Promise<SessionSnapshot> {
    return cloneSnapshot(this.#snapshot)
  }

  async save(snapshot: SessionSnapshot): Promise<void> {
    this.#snapshot = cloneSnapshot(snapshot)
  }
}

function cloneSnapshot(snapshot: SessionSnapshot): SessionSnapshot {
  return structuredClone(snapshot)
}
