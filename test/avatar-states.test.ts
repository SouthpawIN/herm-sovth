import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { parseEikon } from "../src/components/avatar/eikon"
import { AnimatedAvatar } from "../src/components/avatar/AnimatedAvatar"
import { mountNode, until } from "./harness"
import { EIKON_STATE_MAPPING, STATE_FRAMES } from "../src/components/avatar/states"

const CUSTOM = [
  JSON.stringify({ eikon: 1, name: "mapped", width: 5, height: 1, states: ["thinking", "listening"] }),
  JSON.stringify({ state: "thinking", fps: 1, frame_count: 1 }),
  JSON.stringify({ f: 0, data: "THINKING" }),
  JSON.stringify({ state: "listening", fps: 1, frame_count: 1 }),
  JSON.stringify({ f: 0, data: "RAW" }),
].join("\n")

const eikon = parseEikon(CUSTOM)
const node = createElement(AnimatedAvatar, { state: "listening", eikon })

describe("avatar Eikon state mapping", () => {
  test("maps active and error states to expressive Eikon art", () => {
    expect(EIKON_STATE_MAPPING.listening).toBe("thinking")
    expect(EIKON_STATE_MAPPING.working).toBe("thinking")
    expect(EIKON_STATE_MAPPING.error).toBe("speaking")
  })

  test("bundled frames use the same mapped clips", () => {
    expect(STATE_FRAMES.listening).toBe(STATE_FRAMES.thinking)
    expect(STATE_FRAMES.working).toBe(STATE_FRAMES.thinking)
    expect(STATE_FRAMES.error).toBe(STATE_FRAMES.speaking)
  })

  test("custom Eikon prefers mapped art over raw state art", async () => {
    const t = await mountNode(node, { width: 40, height: 10 })
    await until(t, () => t.frame().includes("THINKING"))
    expect(t.frame()).not.toContain("RAW")
    t.destroy()
  })
})
