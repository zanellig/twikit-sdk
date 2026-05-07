import { describe, expect, it } from "vitest"

describe("built package exports", () => {
  it("loads the runtime-neutral root entrypoint", async () => {
    const root = await import("../dist/index.js")

    expect(root.TwikitClient).toBeTypeOf("function")
    expect(root.MemorySession).toBeTypeOf("function")
    expect(root.isTwikitError).toBeTypeOf("function")
  })

  it("loads the node-specific helper entrypoint", async () => {
    const node = await import("../dist/node.js")

    expect(node.FileSession).toBeTypeOf("function")
  })
})
