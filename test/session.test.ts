import { chmod, readFile, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import { MemorySession } from "../src/session/memory-session.js"
import type { StoredCookie } from "../src/session/types.js"
import { SessionService } from "../src/services/session-service.js"
import { FileSession } from "../src/node.js"
import {
  buildCookieHeader,
  deduplicateCt0,
  extractCsrf,
  mergeCookies,
  parseCookieHeader,
  parseSetCookie,
} from "../src/session/cookie-utils.js"

// ---------------------------------------------------------------------------
// cookie-utils unit tests
// ---------------------------------------------------------------------------

describe("parseCookieHeader", () => {
  it("parses a multi-cookie header string", () => {
    const cookies = parseCookieHeader("auth_token=abc; ct0=csrf123; twid=u%3D999")

    expect(cookies).toHaveLength(3)
    expect(cookies[0]).toMatchObject({ name: "auth_token", value: "abc" })
    expect(cookies[1]).toMatchObject({ name: "ct0", value: "csrf123" })
    expect(cookies[2]).toMatchObject({ name: "twid", value: "u%3D999" })

    for (const c of cookies) {
      expect(c.domain).toBe(".x.com")
      expect(c.path).toBe("/")
      expect(c.secure).toBe(true)
      expect(c.httpOnly).toBe(true)
    }
  })

  it("returns an empty array for empty or whitespace input", () => {
    expect(parseCookieHeader("")).toEqual([])
    expect(parseCookieHeader("   ")).toEqual([])
  })

  it("handles values containing equals signs", () => {
    const cookies = parseCookieHeader("token=abc=def==")
    expect(cookies).toHaveLength(1)
    expect(cookies[0]).toMatchObject({ name: "token", value: "abc=def==" })
  })

  it("ignores malformed pairs with no value", () => {
    const cookies = parseCookieHeader("good=yes; ; bad; also_good=ok")
    expect(cookies).toHaveLength(2)
    expect(cookies[0]!.name).toBe("good")
    expect(cookies[1]!.name).toBe("also_good")
  })
})

describe("parseSetCookie", () => {
  it("parses a full Set-Cookie header with attributes", () => {
    const result = parseSetCookie(
      "ct0=newtoken; Domain=.x.com; Path=/; Secure; HttpOnly; SameSite=Lax",
    )

    expect(result).not.toBeNull()
    expect("cookie" in result!).toBe(true)
    const cookie = (result as { cookie: StoredCookie }).cookie
    expect(cookie).toMatchObject({
      name: "ct0",
      value: "newtoken",
      domain: ".x.com",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "lax",
    })
  })

  it("prefixes domain with dot when not present", () => {
    const result = parseSetCookie("foo=bar; Domain=x.com")
    const cookie = (result as { cookie: StoredCookie }).cookie
    expect(cookie.domain).toBe(".x.com")
  })

  it("parses expires into ISO string", () => {
    const result = parseSetCookie(
      "foo=bar; Expires=Wed, 15 Jun 2033 12:00:00 GMT",
    )
    const cookie = (result as { cookie: StoredCookie }).cookie
    expect(cookie.expires).toBeDefined()
    const parsed = new Date(cookie.expires!)
    expect(parsed.getTime()).toBeGreaterThan(Date.now())
    expect(cookie.expires).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it("returns null for unparseable input", () => {
    expect(parseSetCookie("")).toBeNull()
  })

  it("omits optional fields when not present in the header", () => {
    const result = parseSetCookie("minimal=yes")
    const cookie = (result as { cookie: StoredCookie }).cookie
    expect(cookie).toMatchObject({ name: "minimal", value: "yes" })
    expect(cookie.domain).toBeUndefined()
    expect(cookie.path).toBeUndefined()
    expect(cookie.secure).toBeUndefined()
    expect(cookie.httpOnly).toBeUndefined()
    expect(cookie.expires).toBeUndefined()
  })

  it("returns expired marker for Max-Age=0 (deletion directive)", () => {
    const result = parseSetCookie("auth_token=; Max-Age=0; Domain=.x.com; Path=/")
    expect(result).not.toBeNull()
    expect("expired" in result!).toBe(true)
    const expired = (result as { expired: StoredCookie }).expired
    expect(expired.name).toBe("auth_token")
  })

  it("returns expired marker for past Expires", () => {
    const result = parseSetCookie(
      "old=gone; Expires=Thu, 01 Jan 2000 00:00:00 GMT; Domain=.x.com",
    )
    expect(result).not.toBeNull()
    expect("expired" in result!).toBe(true)
  })
})

describe("mergeCookies", () => {
  it("replaces existing cookies by name+domain+path", () => {
    const existing: StoredCookie[] = [
      { name: "ct0", value: "old", domain: ".x.com", path: "/" },
      { name: "auth_token", value: "keep", domain: ".x.com", path: "/" },
    ]
    const incoming: StoredCookie[] = [
      { name: "ct0", value: "new", domain: ".x.com", path: "/" },
    ]

    const merged = mergeCookies(existing, incoming)
    expect(merged).toHaveLength(2)
    expect(merged.find((c) => c.name === "ct0")!.value).toBe("new")
    expect(merged.find((c) => c.name === "auth_token")!.value).toBe("keep")
  })

  it("adds new cookies that do not exist", () => {
    const existing: StoredCookie[] = [
      { name: "a", value: "1" },
    ]
    const incoming: StoredCookie[] = [
      { name: "b", value: "2" },
    ]

    const merged = mergeCookies(existing, incoming)
    expect(merged).toHaveLength(2)
  })
})

describe("deduplicateCt0", () => {
  it("keeps only the first ct0 when duplicates exist", () => {
    const cookies: StoredCookie[] = [
      { name: "ct0", value: "first", domain: ".x.com" },
      { name: "auth_token", value: "tok" },
      { name: "ct0", value: "second", domain: ".x.com" },
      { name: "ct0", value: "third", domain: ".x.com" },
    ]

    const result = deduplicateCt0(cookies)
    const ct0s = result.filter((c) => c.name === "ct0")
    expect(ct0s).toHaveLength(1)
    expect(ct0s[0]!.value).toBe("first")
    expect(result.find((c) => c.name === "auth_token")).toBeDefined()
  })

  it("returns the array unchanged when there is at most one ct0", () => {
    const cookies: StoredCookie[] = [
      { name: "ct0", value: "only" },
      { name: "other", value: "val" },
    ]

    expect(deduplicateCt0(cookies)).toEqual(cookies)
  })

  it("returns the array unchanged when there is no ct0", () => {
    const cookies: StoredCookie[] = [
      { name: "auth_token", value: "tok" },
    ]

    expect(deduplicateCt0(cookies)).toEqual(cookies)
  })
})

describe("extractCsrf", () => {
  it("returns the ct0 cookie value", () => {
    const cookies: StoredCookie[] = [
      { name: "auth_token", value: "tok" },
      { name: "ct0", value: "csrf_value" },
    ]

    expect(extractCsrf(cookies)).toBe("csrf_value")
  })

  it("returns undefined when no ct0 exists", () => {
    expect(extractCsrf([])).toBeUndefined()
    expect(extractCsrf([{ name: "other", value: "v" }])).toBeUndefined()
  })
})

describe("buildCookieHeader", () => {
  it("builds a semicolon-separated cookie header", () => {
    const cookies: StoredCookie[] = [
      { name: "auth_token", value: "tok" },
      { name: "ct0", value: "csrf" },
    ]

    expect(buildCookieHeader(cookies)).toBe("auth_token=tok; ct0=csrf")
  })

  it("returns empty string for empty cookies", () => {
    expect(buildCookieHeader([])).toBe("")
  })

  it("skips cookies with past expires", () => {
    const cookies: StoredCookie[] = [
      { name: "valid", value: "yes" },
      { name: "expired", value: "no", expires: "2000-01-01T00:00:00.000Z" },
      { name: "also_valid", value: "sure", expires: "2099-01-01T00:00:00.000Z" },
    ]

    expect(buildCookieHeader(cookies)).toBe("valid=yes; also_valid=sure")
  })
})

// ---------------------------------------------------------------------------
// SessionService integration tests
// ---------------------------------------------------------------------------

describe("SessionService", () => {
  function createService() {
    const store = new MemorySession()
    const service = new SessionService(store)
    return { store, service }
  }

  describe("importCookieHeader", () => {
    it("imports cookies from a browser-style header string", async () => {
      const { store, service } = createService()

      await service.importCookieHeader("auth_token=abc; ct0=csrf123; twid=u%3D999")

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(3)
      expect(snapshot.cookies.find((c) => c.name === "auth_token")!.value).toBe("abc")
      expect(snapshot.cookies.find((c) => c.name === "ct0")!.value).toBe("csrf123")
      expect(snapshot.cookies.find((c) => c.name === "twid")!.value).toBe("u%3D999")
      expect(snapshot.updatedAt).toBeDefined()
    })

    it("merges with existing cookies", async () => {
      const { store, service } = createService()

      await service.importCookies([
        { name: "existing", value: "keep", domain: ".x.com", path: "/" },
      ])
      await service.importCookieHeader("ct0=new_csrf")

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(2)
      expect(snapshot.cookies.find((c) => c.name === "existing")).toBeDefined()
      expect(snapshot.cookies.find((c) => c.name === "ct0")!.value).toBe("new_csrf")
    })

    it("is a no-op for an empty string", async () => {
      const { store, service } = createService()
      await service.importCookieHeader("")

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(0)
      expect(snapshot.updatedAt).toBeUndefined()
    })
  })

  describe("importCookies", () => {
    it("imports structured cookie objects", async () => {
      const { store, service } = createService()

      await service.importCookies([
        {
          name: "auth_token",
          value: "structured_tok",
          domain: ".x.com",
          path: "/",
          secure: true,
          httpOnly: true,
        },
        {
          name: "ct0",
          value: "structured_csrf",
          domain: ".x.com",
          path: "/",
        },
      ])

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(2)
      expect(snapshot.cookies[0]!.value).toBe("structured_tok")
      expect(snapshot.cookies[1]!.value).toBe("structured_csrf")
    })

    it("replaces cookies with matching name+domain+path", async () => {
      const { store, service } = createService()

      await service.importCookies([
        { name: "ct0", value: "old", domain: ".x.com", path: "/" },
      ])
      await service.importCookies([
        { name: "ct0", value: "updated", domain: ".x.com", path: "/" },
      ])

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(1)
      expect(snapshot.cookies[0]!.value).toBe("updated")
    })

    it("is a no-op for an empty array", async () => {
      const { store, service } = createService()
      await service.importCookies([])

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(0)
      expect(snapshot.updatedAt).toBeUndefined()
    })
  })

  describe("getCsrfToken", () => {
    it("extracts the CSRF token from ct0", async () => {
      const { service } = createService()

      await service.importCookieHeader("auth_token=tok; ct0=my_csrf_token")

      expect(await service.getCsrfToken()).toBe("my_csrf_token")
    })

    it("returns undefined when no ct0 exists", async () => {
      const { service } = createService()

      expect(await service.getCsrfToken()).toBeUndefined()
    })
  })

  describe("getCookieHeader", () => {
    it("builds a cookie header string from stored cookies", async () => {
      const { service } = createService()

      await service.importCookies([
        { name: "auth_token", value: "tok" },
        { name: "ct0", value: "csrf" },
      ])

      expect(await service.getCookieHeader()).toBe("auth_token=tok; ct0=csrf")
    })
  })

  describe("handleSetCookieHeaders", () => {
    it("processes Set-Cookie response headers and updates the store", async () => {
      const { store, service } = createService()

      await service.importCookieHeader("auth_token=tok; ct0=old_csrf")

      await service.handleSetCookieHeaders([
        "ct0=refreshed_csrf; Domain=.x.com; Path=/; Secure; HttpOnly",
      ])

      const snapshot = await store.load()
      const ct0 = snapshot.cookies.find((c) => c.name === "ct0")
      expect(ct0!.value).toBe("refreshed_csrf")
      expect(ct0!.secure).toBe(true)
      expect(ct0!.httpOnly).toBe(true)
    })

    it("adds new cookies from Set-Cookie headers", async () => {
      const { store, service } = createService()

      await service.handleSetCookieHeaders([
        "new_cookie=hello; Domain=.x.com; Path=/",
      ])

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(1)
      expect(snapshot.cookies[0]!.name).toBe("new_cookie")
    })

    it("is a no-op for an empty array", async () => {
      const { store, service } = createService()
      await service.handleSetCookieHeaders([])

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(0)
      expect(snapshot.updatedAt).toBeUndefined()
    })

    it("removes cookies when Set-Cookie has Max-Age=0", async () => {
      const { store, service } = createService()

      await service.importCookies([
        { name: "auth_token", value: "tok", domain: ".x.com", path: "/" },
        { name: "ct0", value: "csrf", domain: ".x.com", path: "/" },
      ])

      await service.handleSetCookieHeaders([
        "auth_token=; Max-Age=0; Domain=.x.com; Path=/",
      ])

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(1)
      expect(snapshot.cookies[0]!.name).toBe("ct0")
    })

    it("removes cookies when Set-Cookie has past Expires", async () => {
      const { store, service } = createService()

      await service.importCookies([
        { name: "old", value: "val", domain: ".x.com", path: "/" },
      ])

      await service.handleSetCookieHeaders([
        "old=; Expires=Thu, 01 Jan 2000 00:00:00 GMT; Domain=.x.com; Path=/",
      ])

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(0)
    })
  })

  describe("duplicate ct0 cleanup", () => {
    it("deduplicates ct0 cookies during import", async () => {
      const { store, service } = createService()

      await service.importCookies([
        { name: "ct0", value: "first", domain: ".x.com", path: "/" },
        { name: "auth_token", value: "tok", domain: ".x.com", path: "/" },
        { name: "ct0", value: "second", domain: ".x.com", path: "/" },
      ])

      const snapshot = await store.load()
      const ct0s = snapshot.cookies.filter((c) => c.name === "ct0")
      expect(ct0s).toHaveLength(1)
      expect(ct0s[0]!.value).toBe("second")
    })

    it("deduplicates ct0 cookies during Set-Cookie processing", async () => {
      const { store, service } = createService()

      // Start with a ct0 from one domain key
      await service.importCookies([
        { name: "ct0", value: "original" },
      ])

      // Set-Cookie introduces another ct0 with different domain
      await service.handleSetCookieHeaders([
        "ct0=from_response; Domain=.x.com; Path=/",
      ])

      const snapshot = await store.load()
      const ct0s = snapshot.cookies.filter((c) => c.name === "ct0")
      expect(ct0s).toHaveLength(1)
    })
  })

  describe("save", () => {
    it("persists the current snapshot", async () => {
      const { store, service } = createService()

      await service.importCookieHeader("auth_token=tok; ct0=csrf")
      await service.save()

      const snapshot = await store.load()
      expect(snapshot.cookies).toHaveLength(2)
    })
  })

  describe("session timestamps", () => {
    it("sets updatedAt on importCookieHeader", async () => {
      const { store, service } = createService()
      const before = new Date().toISOString()

      await service.importCookieHeader("ct0=val")

      const snapshot = await store.load()
      expect(snapshot.updatedAt).toBeDefined()
      expect(snapshot.updatedAt! >= before).toBe(true)
    })

    it("sets updatedAt on importCookies", async () => {
      const { store, service } = createService()
      const before = new Date().toISOString()

      await service.importCookies([{ name: "ct0", value: "val" }])

      const snapshot = await store.load()
      expect(snapshot.updatedAt).toBeDefined()
      expect(snapshot.updatedAt! >= before).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// MemorySession tests
// ---------------------------------------------------------------------------

describe("MemorySession", () => {
  it("round-trips a snapshot through save and load", async () => {
    const session = new MemorySession()
    const cookies: StoredCookie[] = [
      { name: "auth_token", value: "tok", domain: ".x.com", path: "/" },
      { name: "ct0", value: "csrf", domain: ".x.com", path: "/" },
    ]

    await session.save({ cookies, userId: "123", updatedAt: new Date().toISOString() })
    const loaded = await session.load()

    expect(loaded.cookies).toHaveLength(2)
    expect(loaded.userId).toBe("123")
  })

  it("returns independent clones on each load", async () => {
    const session = new MemorySession()
    await session.save({ cookies: [{ name: "a", value: "1" }] })

    const a = await session.load()
    const b = await session.load()

    a.cookies.push({ name: "mutated", value: "x" })
    expect((await session.load()).cookies).toHaveLength(1)
    expect(b.cookies).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// FileSession tests
// ---------------------------------------------------------------------------

describe("FileSession", () => {
  const testDir = join(tmpdir(), `twikit-test-${Date.now()}`)
  const testFile = join(testDir, "session.json")

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  it("creates a new session file with restrictive permissions", async () => {
    const session = await FileSession.load(testFile)
    await session.save({
      cookies: [{ name: "auth_token", value: "tok" }],
    })

    const raw = await readFile(testFile, "utf8")
    const data = JSON.parse(raw)
    expect(data.cookies).toHaveLength(1)
    expect(data.cookies[0].name).toBe("auth_token")

    const info = await stat(testFile)
    expect(info.mode & 0o777).toBe(0o600)
  })

  it("enforces 0o600 on save even if file had permissive mode", async () => {
    const session = await FileSession.load(testFile)
    await session.save({ cookies: [{ name: "a", value: "1" }] })

    // Widen permissions to simulate a pre-existing permissive file
    await chmod(testFile, 0o644)
    const before = await stat(testFile)
    expect(before.mode & 0o777).toBe(0o644)

    // Save again -- should restore restrictive mode
    await session.save({ cookies: [{ name: "a", value: "2" }] })
    const after = await stat(testFile)
    expect(after.mode & 0o777).toBe(0o600)
  })

  it("loads an existing session file", async () => {
    const session1 = await FileSession.load(testFile)
    await session1.save({
      cookies: [
        { name: "ct0", value: "saved_csrf", domain: ".x.com", path: "/" },
      ],
      userId: "42",
    })

    const session2 = await FileSession.load(testFile)
    const snapshot = await session2.load()
    expect(snapshot.cookies).toHaveLength(1)
    expect(snapshot.cookies[0]!.value).toBe("saved_csrf")
    expect(snapshot.userId).toBe("42")
  })

  it("returns empty cookies for a non-existent file", async () => {
    const session = await FileSession.load(join(testDir, "missing.json"))
    const snapshot = await session.load()
    expect(snapshot.cookies).toEqual([])
  })

  it("works with SessionService for a full import-save-reload cycle", async () => {
    const session = await FileSession.load(testFile)
    const service = new SessionService(session)

    await service.importCookieHeader("auth_token=file_tok; ct0=file_csrf")
    await service.save()

    const reloaded = await FileSession.load(testFile)
    const snapshot = await reloaded.load()
    expect(snapshot.cookies).toHaveLength(2)
    expect(snapshot.cookies.find((c) => c.name === "ct0")!.value).toBe("file_csrf")
  })
})
