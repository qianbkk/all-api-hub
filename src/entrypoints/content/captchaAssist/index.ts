import { createLogger } from "~/utils/core/logger"

import { dragSliderBy } from "./dragSimulation"
import { detectGap } from "./gapAnalysis"
import {
  findSliderCaptchaCandidate,
  type SliderCaptchaCandidate,
} from "./sliderDetection"

const logger = createLogger("CaptchaAssist")

/**
 * Best-effort slider CAPTCHA assistance (opt-in).
 *
 * Flow:
 * 1. Watch the document for a slider handle.
 * 2. When found, read the background pixels and detect the gap.
 * 3. If confident, drag the handle to the gap with a human-like trajectory.
 * 4. Anything uncertain is left untouched so the user can complete it in the
 *    visible tab opened by the protection-bypass flow.
 *
 * This is heuristic and NOT guaranteed to work on every CAPTCHA vendor. It
 * never bypasses accessibility or security features beyond what a user could
 * do by hand.
 */

export interface CaptchaAssistOptions {
  enabled: boolean
}

interface SolveState {
  attempts: number
  lastSolvedAt: number
}

const MAX_ATTEMPTS = 2
const COOLDOWN_MS = 60_000

/**
 * Creates the slider solver controller (scan + attempt + cooldown state).
 */
function createSolver() {
  let observer: MutationObserver | null = null
  let solving = false
  let disposed = false
  const state: SolveState = { attempts: 0, lastSolvedAt: 0 }

  const trySolve = async (candidate: SliderCaptchaCandidate) => {
    if (solving || disposed) {
      return
    }
    const now = Date.now()
    if (
      state.attempts >= MAX_ATTEMPTS ||
      now - state.lastSolvedAt < COOLDOWN_MS
    ) {
      return
    }
    solving = true
    try {
      state.attempts += 1

      const trackRect = candidate.track.getBoundingClientRect()
      const trackWidth = Math.max(1, trackRect.width)
      const gap = await detectGap(candidate.backgroundElement, trackWidth)

      if (!gap) {
        logger.debug("Gap not confidently detected; leaving for manual solve")
        return
      }

      // The drag distance is the gap offset minus the handle's current left
      // position within the track.
      const handleRect = candidate.handle.getBoundingClientRect()
      const handleLeftInTrack = Math.max(
        0,
        handleRect.left - trackRect.left,
      )
      const distance = Math.max(1, gap.offsetPx - handleLeftInTrack)

      if (distance < 4) {
        logger.debug("Handle already at gap; skipping drag", { distance })
        return
      }

      const dragged = await dragSliderBy(candidate.handle, distance)
      state.lastSolvedAt = Date.now()
      logger.info("Slider assist attempt finished", {
        distance,
        dragged,
        confidence: gap.confidence,
      })
    } catch (error) {
      logger.warn("Slider assist failed", error)
    } finally {
      solving = false
    }
  }

  const scan = () => {
    if (disposed || solving) {
      return
    }
    const candidate = findSliderCaptchaCandidate()
    if (candidate) {
      void trySolve(candidate)
    }
  }

  const start = () => {
    scan()
    observer = new MutationObserver(() => scan())
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    })
  }

  const stop = () => {
    disposed = true
    observer?.disconnect()
    observer = null
  }

  return { start, stop }
}

/**
 * Sets up (or tears down) the CAPTCHA assist controller.
 * Returns a cleanup function.
 */
export function setupCaptchaAssistContent(
  options: CaptchaAssistOptions,
): () => void {
  if (!options.enabled) {
    return () => {}
  }

  logger.info("Captcha assist enabled")
  const solver = createSolver()
  solver.start()
  return () => solver.stop()
}
