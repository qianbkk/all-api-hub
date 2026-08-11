import { createLogger } from "~/utils/core/logger"

const logger = createLogger("CaptchaAssistDrag")

/**
 * Human-like drag simulation for slider CAPTCHAs.
 *
 * We synthesize pointer/mouse events with a trajectory that resembles a real
 * drag: quick start, mid-way jitter, decelerating approach, tiny final
 * correction. Every run is slightly different (random seed) so repeated
 * solves do not share an identical path.
 */

/** Random-ish PRNG (mulberry32) so traces vary but are reproducible per seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Builds a sequence of absolute page offsets that simulate a human drag from
 * `startX` to `endX` at fixed `y`.
 */
function buildTrajectory(  startX: number,
  endX: number,
  y: number,
  random: () => number,
): Array<{ x: number; y: number }> {
  const distance = endX - startX
  const steps = 24 + Math.floor(random() * 18)
  const points: Array<{ x: number; y: number }> = []

  // Ease-out curve with overshoot-free approach and per-step jitter.
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    // Ease-out cubic: fast start, slow end (humans decelerate into the target).
    const eased = 1 - Math.pow(1 - t, 3)
    let x = startX + distance * eased
    // Add decreasing jitter so the tail lands close to the target.
    const jitter = (1 - t) * (4 + random() * 6)
    x += (random() - 0.5) * jitter
    // Small vertical wobble while dragging.
    const yWobble = (random() - 0.5) * 3
    points.push({ x: Math.round(x), y: Math.round(y + yWobble) })
  }

  // Ensure the final point hits exactly the target offset.
  points[points.length - 1] = { x: Math.round(endX), y: Math.round(y) }
  return points
}

/**
 * Dispatches a synthetic mouse event on the target.
 */
function dispatchEvent(target: Element, type: string, clientX: number, clientY: number) {
  const init: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
    button: 0,
    buttons: type === "mouseup" ? 0 : 1,
  }
  target.dispatchEvent(new MouseEvent(type, init))
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Drags `handle` by `offsetX` pixels to the right using pointer events and
 * mouse events. Resolves true when the drag completed.
 */
export async function dragSliderBy(
  handle: HTMLElement,
  offsetX: number,
  seed = Date.now(),
): Promise<boolean> {
  if (offsetX <= 0) {
    return false
  }

  const random = mulberry32(seed)
  const rect = handle.getBoundingClientRect()
  const startX = rect.left + rect.width / 2
  const startY = rect.top + rect.height / 2
  const endX = startX + offsetX

  const target = (handle as HTMLElement & {
    releasePointerCapture?: (pointerId: number) => void
  })

  try {
    // Pointer events first (modern browsers + iframes).
    const pointerId = 1
    target.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerId,
        pointerType: "mouse",
        clientX: startX,
        clientY: startY,
        button: 0,
        buttons: 1,
      }),
    )
    await sleep(60 + random() * 120)

    const points = buildTrajectory(startX, endX, startY, random)
    for (let i = 1; i < points.length; i += 1) {
      const p = points[i]
      target.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          pointerId,
          pointerType: "mouse",
          clientX: p.x,
          clientY: p.y,
          button: 0,
          buttons: 1,
        }),
      )
      // Also dispatch mouse move for libraries listening to mouse events.
      dispatchEvent(target, "mousemove", p.x, p.y)
      // Varying inter-step delay (10-45ms) plus occasional pause.
      await sleep(10 + random() * 35 + (i % 7 === 0 ? 40 + random() * 60 : 0))
    }

    target.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerId,
        pointerType: "mouse",
        clientX: endX,
        clientY: startY,
        button: 0,
        buttons: 0,
      }),
    )
    dispatchEvent(target, "mouseup", endX, startY)

    // Some libraries only respond to click.
    dispatchEvent(target, "click", endX, startY)

    if (typeof target.releasePointerCapture === "function") {
      try {
        target.releasePointerCapture(pointerId)
      } catch {
        // Ignore: pointer capture may not be active.
      }
    }

    logger.debug("Drag completed", { offsetX, points: points.length })
    return true
  } catch (error) {
    logger.warn("Drag failed", error)
    return false
  }
}
