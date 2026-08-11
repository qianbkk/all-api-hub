import { createLogger } from "~/utils/core/logger"

const logger = createLogger("CaptchaAssistGap")

/**
 * Gap (缺口) detection for slider CAPTCHAs using pure pixel analysis.
 *
 * Strategy: the background is drawn to an off-screen canvas. A puzzle slider
 * typically has the target notch cut out of the right-side background, so the
 * column at the notch's left edge shows a sharp luminance difference from its
 * neighbours. We scan columns and look for the strongest sustained edge.
 *
 * This is intentionally heuristic: it works for common puzzle sliders but is
 * NOT vendor-perfect. When confidence is low the caller must fall back to
 * manual solving.
 */

export interface GapResult {
  /** Horizontal pixel offset of the gap center (CSS px). */
  offsetPx: number
  /** 0..1 confidence. */
  confidence: number
}

const MIN_COL_DIFF = 18
const GAP_WIDTH_GUESS_PX = 48

/**
 * Draws the background element onto an off-screen canvas. Returns null when
 * the element cannot be read (cross-origin taint, not an image, etc.).
 */
async function rasterizeBackground(
  element: HTMLCanvasElement | HTMLImageElement | null,
  maxSize = 520,
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null> {
  if (!element) {
    return null
  }

  let source: CanvasImageSource
  if (element instanceof HTMLCanvasElement) {
    source = element
  } else if (element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0) {
    source = element
  } else {
    return null
  }

  try {
    const canvas = document.createElement("canvas")
    const scale = Math.min(1, maxSize / Math.max(source.width, source.height))
    canvas.width = Math.max(1, Math.round(source.width * scale))
    canvas.height = Math.max(1, Math.round(source.height * scale))
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) {
      return null
    }
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
    // Force a read to catch tainted canvas (cross-origin) early.
    ctx.getImageData(0, 0, 1, 1)
    return { canvas, ctx }
  } catch (error) {
    logger.debug("Background rasterization failed (likely cross-origin)", error)
    return null
  }
}

/**
 * Column-wise luminance edge strength: for each column, the average absolute
 * difference to the column 4px to its left (the gap edge is typically sharp).
 */
function columnEdgeStrengths(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): Float32Array {
  const data = ctx.getImageData(0, 0, width, height).data
  const strengths = new Float32Array(width)

  for (let x = 4; x < width; x += 1) {
    let sum = 0
    let count = 0
    for (let y = 8; y < height - 8; y += 2) {
      const i = (y * width + x) * 4
      const j = (y * width + (x - 4)) * 4
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
      const lumPrev = (data[j] + data[j + 1] + data[j + 2]) / 3
      sum += Math.abs(lum - lumPrev)
      count += 1
    }
    strengths[x] = count > 0 ? sum / count : 0
  }
  return strengths
}

/**
 * Detects the horizontal gap center in the rasterized background.
 */
export function detectGap(
  element: HTMLCanvasElement | HTMLImageElement | null,
  trackWidthPx: number,
): Promise<GapResult | null> {
  return (async () => {
    const raster = await rasterizeBackground(element)
    if (!raster) {
      return null
    }
    const { ctx, canvas } = raster
    const strengths = columnEdgeStrengths(ctx, canvas.width, canvas.height)

    // Find the strongest edge, ignoring the extreme left (where the slider
    // handle itself often sits) and requiring a sustained run of strong
    // columns (a gap is ~GAP_WIDTH_GUESS_PX wide, not a single-pixel spike).
    let bestX = -1
    let bestScore = MIN_COL_DIFF
    for (let x = Math.round(canvas.width * 0.15); x < canvas.width - 40; x += 1) {
      const runStart = x
      const runEnd = Math.min(canvas.width - 1, x + Math.round(GAP_WIDTH_GUESS_PX * 0.6))
      let score = 0
      for (let k = runStart; k <= runEnd; k += 1) {
        score += strengths[k] ?? 0
      }
      if (score > bestScore) {
        bestScore = score
        bestX = x
      }
    }

    if (bestX < 0) {
      return null
    }

    // Convert canvas px back to CSS px using the track width.
    const scale = canvas.width > 0 ? trackWidthPx / canvas.width : 1
    const offsetPx = Math.round(bestX * scale)
    const confidence = Math.min(1, bestScore / (MIN_COL_DIFF * 60))

    logger.debug("Gap detected", { bestX, offsetPx, confidence, canvasWidth: canvas.width })

    return confidence >= 0.3 ? { offsetPx, confidence } : null
  })()
}
