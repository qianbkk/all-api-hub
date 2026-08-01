import type { SiteAccount } from "~/types"

export const SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS = 30_000
export const SAME_ORIGIN_CHECKIN_STAGGER_MAX_MS = 300_000

/**
 * Normalizes an account site URL into the origin used for per-site scheduling.
 */
export function getAccountSiteOrigin(account: Pick<SiteAccount, "site_url">) {
  const siteUrl = typeof account.site_url === "string" ? account.site_url : ""

  try {
    return new URL(siteUrl).origin.toLowerCase()
  } catch {
    return siteUrl.trim().replace(/\/+$/, "").toLowerCase()
  }
}

/**
 * Returns a bounded delay for later accounts sharing the same site origin.
 *
 * The delay is an operational load-spreading control. It does not alter network
 * identity, browser fingerprint, credentials, or any upstream security signal.
 */
export function createSameOriginCheckinDelayMs(
  random: () => number = Math.random,
): number {
  const normalizedRandom = Math.min(1, Math.max(0, random()))
  return Math.round(
    SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS +
      normalizedRandom *
        (SAME_ORIGIN_CHECKIN_STAGGER_MAX_MS -
          SAME_ORIGIN_CHECKIN_STAGGER_MIN_MS),
  )
}

/**
 * Builds per-account start delays. The first account for an origin starts
 * immediately; subsequent accounts are spaced by independent bounded delays.
 */
export function buildSameOriginCheckinDelays(
  accounts: Array<Pick<SiteAccount, "id" | "site_url">>,
  random: () => number = Math.random,
): Map<string, number> {
  const nextDelayByOrigin = new Map<string, number>()
  const delaysByAccountId = new Map<string, number>()

  for (const account of accounts) {
    const origin = getAccountSiteOrigin(account)
    const delay = nextDelayByOrigin.get(origin) ?? 0
    delaysByAccountId.set(account.id, delay)
    nextDelayByOrigin.set(
      origin,
      delay + createSameOriginCheckinDelayMs(random),
    )
  }

  return delaysByAccountId
}
