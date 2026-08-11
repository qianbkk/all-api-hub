import { describe, expect, it } from "vitest"

import {
  buildSameOriginCheckinDelays,
  createSameOriginCheckinDelayMs,
  getAccountSiteOrigin,
  SAME_ORIGIN_CHECKIN_STAGGER_MAX_MS,
  SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS,
} from "~/services/checkin/autoCheckin/accountStagger"

describe("same-origin check-in staggering", () => {
  it("normalizes valid origins and falls back for non-URL input", () => {
    expect(
      getAccountSiteOrigin({ site_url: "HTTPS://Example.com/path/" }),
    ).toBe("https://example.com")
    expect(getAccountSiteOrigin({ site_url: " custom-origin///" })).toBe(
      "custom-origin",
    )
  })

  it("keeps generated spacing within the configured 30-300 second range", () => {
    expect(createSameOriginCheckinDelayMs(() => -1)).toBe(
      SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS,
    )
    expect(createSameOriginCheckinDelayMs(() => 1)).toBe(
      SAME_ORIGIN_CHECKIN_STAGGER_MAX_MS,
    )
  })

  it("starts distinct origins immediately and staggers later same-origin accounts", () => {
    const values = [0, 0, 1]
    const delays = buildSameOriginCheckinDelays(
      [
        { id: "first-a", site_url: "https://a.example/dashboard" },
        { id: "first-b", site_url: "https://b.example" },
        { id: "second-a", site_url: "https://a.example/account" },
        { id: "third-a", site_url: "https://a.example" },
      ],
      { random: () => values.shift() ?? 0 },
    )

    expect(delays.get("first-a")).toBe(0)
    expect(delays.get("first-b")).toBe(0)
    expect(delays.get("second-a")).toBe(SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS)
    expect(delays.get("third-a")).toBe(
      SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS + SAME_ORIGIN_CHECKIN_STAGGER_MAX_MS,
    )
  })

  it("keeps compact stagger behavior when spread window is omitted", () => {
    const delays = buildSameOriginCheckinDelays(
      [
        { id: "a1", site_url: "https://a.example" },
        { id: "a2", site_url: "https://a.example" },
      ],
      { random: () => 0 },
    )
    expect(delays.get("a1")).toBe(0)
    expect(delays.get("a2")).toBe(SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS)
  })

  it("spreads later same-origin accounts inside the anti-detection window", () => {
    const spreadWindowMs = 60 * 60 * 1000 // 1 hour
    const delays = buildSameOriginCheckinDelays(
      [
        { id: "a1", site_url: "https://a.example" },
        { id: "a2", site_url: "https://a.example" },
        { id: "a3", site_url: "https://a.example" },
        { id: "b1", site_url: "https://b.example" },
      ],
      { random: () => 0.5, spreadWindowMs },
    )

    // First account of each origin starts immediately.
    expect(delays.get("a1")).toBe(0)
    expect(delays.get("b1")).toBe(0)
    // Later accounts get an independent offset inside the window (5s floor).
    const expectedMid = 5_000 + 0.5 * (spreadWindowMs - 5_000)
    expect(delays.get("a2")).toBe(expectedMid)
    expect(delays.get("a3")).toBe(expectedMid)
    // Offsets must never exceed the configured window.
    for (const delay of delays.values()) {
      expect(delay).toBeGreaterThanOrEqual(0)
      expect(delay).toBeLessThanOrEqual(spreadWindowMs)
    }
  })
})
