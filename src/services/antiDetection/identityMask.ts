import { userPreferences } from "~/services/preferences/userPreferences"

/**
 * Identity-mask helpers for multi-account check-in.
 *
 * Goal: when the anti-detection preference is enabled, requests issued for
 * different accounts on the same site should look slightly different to the
 * upstream service (here: Accept-Language) without leaking the account link.
 *
 * Platform note (honest limits):
 * - Chromium forbids JS and declarativeNetRequest from rewriting User-Agent /
 *   Sec-CH-UA headers, so a single browser profile still shares one UA across
 *   accounts. Real UA + IP isolation requires separate browser profiles with
 *   per-profile proxy settings (see research report).
 * - Accept-Language is settable from fetch(), so we vary it per account.
 */

const ACCEPT_LANGUAGE_VARIANTS = [
  "zh-CN,zh;q=0.9,en;q=0.8",
  "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
  "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
  "zh-CN,zh;q=0.9",
  "en,en-US;q=0.9,zh-CN;q=0.8",
  "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
] as const

/**
 * Deterministic non-cryptographic hash (djb2) so the same account always maps
 * to the same variant across calls and sessions.
 */
function hashString(value: string): number {
  let hash = 5381
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return hash >>> 0
}

/**
 * Picks a stable Accept-Language variant for an account user id.
 * Returns undefined when no stable key is available.
 */
export function pickAcceptLanguageForAccount(
  userId: string | number | undefined,
): string | undefined {
  if (userId === undefined || userId === null || userId === "") {
    return undefined
  }
  const key = String(userId)
  const index = hashString(key) % ACCEPT_LANGUAGE_VARIANTS.length
  return ACCEPT_LANGUAGE_VARIANTS[index]
}

/**
 * Whether the anti-detection feature is enabled.
 *
 * Cached briefly (30s) because this is read on every API request; the setting
 * is changed from the options page and a short delay before taking effect is
 * acceptable.
 */
let cachedEnabled: boolean | null = null
let cachedAtMs = 0
const ENABLED_CACHE_TTL_MS = 30_000

/**
 * Whether the anti-detection feature is enabled.
 */
export async function isAntiDetectionEnabled(): Promise<boolean> {
  const now = Date.now()
  if (cachedEnabled !== null && now - cachedAtMs < ENABLED_CACHE_TTL_MS) {
    return cachedEnabled
  }
  try {
    const prefs = await userPreferences.getPreferences()
    cachedEnabled = prefs.antiDetection?.enabled === true
  } catch {
    cachedEnabled = false
  }
  cachedAtMs = Date.now()
  return cachedEnabled
}

/** Resets the enabled-state cache (call after saving preferences). */
export function invalidateAntiDetectionCache(): void {
  cachedEnabled = null
  cachedAtMs = 0
}

/**
 * Resolves the Accept-Language to use for an account's API requests.
 * Returns undefined when the feature is disabled or the account has no stable
 * user id (caller should then keep the browser default header).
 */
export async function resolveAccountAcceptLanguage(
  userId: string | number | undefined,
): Promise<string | undefined> {
  if (!(await isAntiDetectionEnabled())) {
    return undefined
  }
  return pickAcceptLanguageForAccount(userId)
}
