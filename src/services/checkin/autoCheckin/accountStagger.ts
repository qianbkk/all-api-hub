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
 *
 * When `spreadWindowMs` is provided (anti-detection mode), subsequent accounts
 * of the same origin start at independent random offsets inside the window
 * (with a small 5s floor so they never fire at the exact same time). This
 * makes same-site multi-account batches look like independent daily visits
 * instead of a compact sequential run. The compact 30-300s behavior stays the
 * default when the option is omitted.
 */
export function buildSameOriginCheckinDelays(
  accounts: Array<Pick<SiteAccount, "id" | "site_url">>,
  options: { random?: () => number; spreadWindowMs?: number } = {},
): Map<string, number> {
  const random = options.random ?? Math.random
  const spreadWindowMs = options.spreadWindowMs
  const seenByOrigin = new Set<string>()
  const delaysByAccountId = new Map<string, number>()
  const nextDelayByOrigin = new Map<string, number>()

  for (const account of accounts) {
    const origin = getAccountSiteOrigin(account)
    const firstOfOrigin = !seenByOrigin.has(origin)
    seenByOrigin.add(origin)

    if (spreadWindowMs && spreadWindowMs > 0 && !firstOfOrigin) {
      // Anti-detection spread: independent random offset inside the window.
      const floorMs = 5_000
      const range = Math.max(0, spreadWindowMs - floorMs)
      const delayMs = Math.round(
        floorMs + normalizedRandom(random) * range,
      )
      delaysByAccountId.set(account.id, delayMs)
      continue
    }

    const delay = nextDelayByOrigin.get(origin) ?? 0
    delaysByAccountId.set(account.id, delay)
    nextDelayByOrigin.set(
      origin,
      delay + createSameOriginCheckinDelayMs(random),
    )
  }

  return delaysByAccountId
}

/**
 * Clamps a raw random() result into the 0..1 range.
 */
function normalizedRandom(random: () => number): number {
  return Math.min(1, Math.max(0, random()))
}
