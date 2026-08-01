import {
  SITE_ANNOUNCEMENT_INSIGHT_TYPES,
  type SiteAnnouncementInsight,
  type SiteAnnouncementInsightType,
} from "~/types/siteAnnouncements"

import { buildAnnouncementDisplayText } from "./text"

const INSIGHT_RULES: ReadonlyArray<{
  type: SiteAnnouncementInsightType
  high: RegExp
  medium: RegExp
}> = [
  {
    type: SITE_ANNOUNCEMENT_INSIGHT_TYPES.ModelLaunch,
    high: /(?:模型|model).{0,12}(?:上新|上线|新增|发布|launch|available|added)|(?:上新|上线|新增|发布|launch).{0,12}(?:模型|model)/iu,
    medium:
      /(?:gpt|claude|gemini|deepseek|qwen|llama|grok)[-\w.]*(?:上线|available|launch|发布)/iu,
  },
  {
    type: SITE_ANNOUNCEMENT_INSIGHT_TYPES.Promotion,
    high: /特价|限时|折扣|优惠|促销|降价|免费额度|special offer|promotion|discount|sale/iu,
    medium: /(?:充值|recharge).{0,12}(?:赠送|返利|bonus|cashback)/iu,
  },
  {
    type: SITE_ANNOUNCEMENT_INSIGHT_TYPES.PricingChange,
    high: /倍率.{0,12}(?:调整|变更|更新|上调|下调)|(?:价格|定价|price|pricing).{0,12}(?:调整|变更|更新|上调|下调|change|update)/iu,
    medium:
      /(?:调整|变更|更新|change|update).{0,12}(?:倍率|价格|定价|price|pricing)/iu,
  },
  {
    type: SITE_ANNOUNCEMENT_INSIGHT_TYPES.Maintenance,
    high: /维护|故障|中断|不可用|maintenance|incident|outage|unavailable/iu,
    medium: /升级.{0,12}(?:服务|系统|节点)|(?:service|system).{0,12}upgrade/iu,
  },
]

/**
 * Classifies product-relevant announcement topics with deterministic local rules.
 * Raw announcement text stays local and is never sent to an external model.
 */
export function classifySiteAnnouncement(input: {
  title?: string
  content?: string
}): SiteAnnouncementInsight[] {
  const display = buildAnnouncementDisplayText(input)
  const text = `${display.title}\n${display.body}`

  const insights: SiteAnnouncementInsight[] = []

  for (const rule of INSIGHT_RULES) {
    if (rule.high.test(text)) {
      insights.push({ type: rule.type, confidence: "high" })
    } else if (rule.medium.test(text)) {
      insights.push({ type: rule.type, confidence: "medium" })
    }
  }

  return insights
}
