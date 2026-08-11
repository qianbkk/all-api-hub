import { createLogger } from "~/utils/core/logger"

const logger = createLogger("CaptchaAssistSlider")

/**
 * Slider CAPTCHA detection helpers.
 *
 * We intentionally use broad, heuristic selectors so that simple self-hosted
 * sliders (and common libs like geetest-style DOM shapes) are found without
 * hard-coding one vendor. Anything ambiguous is treated as "not a slider" and
 * left for the user.
 */

export interface SliderCaptchaCandidate {
  /** The draggable handle element (the button you pull). */
  handle: HTMLElement
  /** The track / container element that holds the background. */
  track: HTMLElement
  /** Best-effort element whose pixels form the background (canvas or img). */
  backgroundElement: HTMLCanvasElement | HTMLImageElement | null
}

const HANDLE_SELECTORS = [
  '[role="slider"]',
  '[class*="geetest_slider"]',
  '[class*="slider-btn"]',
  '[class*="slider_button"]',
  '[class*="slide-btn"]',
  '[class*="drag_btn"]',
  '[class*="drag-btn"]',
  '[class*="verify-slider"]',
  '[class*="captcha_slider"]',
  '[class*="captcha-slider"]',
  '[class*="secsdk-captcha-drag-icon"]',
  '[class*="tc-action-drag"]',
  "[class*='J-slider']",
] as const

/**
 * True when the element looks like a draggable slider handle (has size and is
 * inside the document).
 */
function looksLikeHandle(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) {
    return false
  }
  const rect = el.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) {
    return false
  }
  // A slider handle is typically wide-ish but not a full page element.
  return rect.width < 200 && rect.height < 80
}

/**
 * Finds the closest background element inside the track: a canvas or an image
 * (visible or used as background-image) that we can read pixels from.
 */
function findBackgroundElement(track: HTMLElement): SliderCaptchaCandidate["backgroundElement"] {
  const canvas = track.querySelector<HTMLCanvasElement>("canvas")
  if (canvas) {
    return canvas
  }
  const img = track.querySelector<HTMLImageElement>("img")
  if (img) {
    return img
  }
  // Fall back to the first element with a background-image URL (we cannot read
  // its pixels without a canvas draw, but the gap analysis accepts it).
  for (const el of track.querySelectorAll<HTMLElement>("[style*='background-image']")) {
    if (getComputedStyle(el).backgroundImage !== "none") {
      return el as unknown as HTMLImageElement
    }
  }
  return null
}

/**
 * Scans the document for a slider CAPTCHA candidate.
 * @returns the first confident candidate, or null when none is found.
 */
export function findSliderCaptchaCandidate(): SliderCaptchaCandidate | null {
  let handle: HTMLElement | null = null
  let track: HTMLElement | null = null

  for (const selector of HANDLE_SELECTORS) {
    const el = document.querySelector(selector)
    if (el && looksLikeHandle(el)) {
      handle = el
      break
    }
  }

  if (!handle) {
    // Fallback: an element whose class contains "slider" and that sits inside
    // a container with a background is a reasonable handle.
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[class*="slider"], [class*="drag"], [class*="verify"], [class*="captcha"]',
      ),
    ).filter(looksLikeHandle)
    if (candidates.length > 0) {
      handle = candidates[0]
    }
  }

  if (!handle) {
    return null
  }
  const resolvedHandle: HTMLElement = handle as HTMLElement

  // The track is the nearest ancestor container that also has a background or
  // canvas; otherwise fall back to the handle's parent (or the handle itself).
  let current = handle.parentElement
  while (current && current !== document.body) {
    if (
      current.querySelector("canvas") ||
      /slider|captcha|verify|geetest|drag/i.test(
        `${current.className}`,
      )
    ) {
      track = current
      break
    }
    current = current.parentElement
  }
  if (!track) {
    track = handle.parentElement ?? handle
  }

  const backgroundElement = track ? findBackgroundElement(track) : null

  logger.debug("Found slider candidate", {
    handleClass: resolvedHandle.className,
    trackClass: track?.className,
    hasBackground: Boolean(backgroundElement),
  })

  return { handle: resolvedHandle, track, backgroundElement }
}

/**
 * Waits up to `timeoutMs` for a slider candidate to appear (some pages render
 * the CAPTCHA a moment after load).
 */
export function waitForSliderCandidate(
  timeoutMs = 10_000,
): Promise<SliderCaptchaCandidate | null> {
  return new Promise((resolve) => {
    const found = findSliderCaptchaCandidate()
    if (found) {
      resolve(found)
      return
    }
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const candidate = findSliderCaptchaCandidate()
      if (candidate || Date.now() - startedAt > timeoutMs) {
        window.clearInterval(timer)
        observer.disconnect()
        resolve(candidate)
      }
    }, 500)
    const observer = new MutationObserver(() => {
      const candidate = findSliderCaptchaCandidate()
      if (candidate) {
        window.clearInterval(timer)
        observer.disconnect()
        resolve(candidate)
      }
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  })
}
