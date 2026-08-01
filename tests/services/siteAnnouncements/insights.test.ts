import { describe, expect, it } from "vitest"

import { classifySiteAnnouncement } from "~/services/siteAnnouncements/insights"
import { SITE_ANNOUNCEMENT_INSIGHT_TYPES } from "~/types/siteAnnouncements"

describe("site announcement insights", () => {
  it("detects model launches, promotions, and pricing changes", () => {
    const insights = classifySiteAnnouncement({
      title: "模型上新与限时特价",
      content: "Claude 5 模型正式上线，价格下调并调整倍率。",
    })

    expect(insights.map((insight) => insight.type)).toEqual(
      expect.arrayContaining([
        SITE_ANNOUNCEMENT_INSIGHT_TYPES.ModelLaunch,
        SITE_ANNOUNCEMENT_INSIGHT_TYPES.Promotion,
        SITE_ANNOUNCEMENT_INSIGHT_TYPES.PricingChange,
      ]),
    )
  })

  it("detects operational maintenance notices", () => {
    expect(
      classifySiteAnnouncement({
        content: "Maintenance window: API unavailable",
      }),
    ).toContainEqual({
      type: SITE_ANNOUNCEMENT_INSIGHT_TYPES.Maintenance,
      confidence: "high",
    })
  })

  it("returns no labels for ordinary informational notices", () => {
    expect(
      classifySiteAnnouncement({ content: "欢迎使用本站，请妥善保管密钥。" }),
    ).toEqual([])
  })
})
