import { mix } from '@/utils/math'
import { seededRandom, type Random } from '@/utils/random'
import {
  BACK_STRIP_EDGE_TINTS,
  BACK_STRIP_LIT,
  BACK_STRIP_SHADED,
  BAND_RELIEF_STRENGTH,
  BAND_TINT,
  CAST_SHADOW_RGB,
  CAST_SHADOW_STEPS,
  COLLAR_BANDS,
  COLLAR_BOTTOM,
  COLLAR_HIGHLIGHT,
  COLLAR_HIGHLIGHT_INSET,
  COLLAR_HIGHLIGHT_SHARE,
  COLLAR_LEFT,
  COLLAR_LINE_WIDTH,
  COLLAR_RIGHT,
  COLLAR_SHADES,
  COLLAR_TOP,
  EDGE_TINTS,
  FOLD_DARK,
  FOLD_LIGHT,
  FOLD_WIDTH,
  KNOT_COLOR,
  KNOT_RADIUS,
  KNOT_SQUASH,
  KNOT_X,
  KNOT_Y,
  MAX_PIXEL_RATIO,
  PAPER_CENTER,
  PAPER_EDGE,
  PARCHMENT_MARGIN,
  RIM_FACING_MIN,
  RIM_LEVELS,
  RIM_OPACITY,
  RIM_RGB,
  RIM_WIDTH,
  ROD_BOTTOM,
  ROD_GRAIN,
  ROD_GRAIN_LINES,
  ROD_GRAIN_SPREAD,
  ROD_GRAIN_WIDTH,
  ROD_GRAIN_WOBBLE,
  ROD_LEFT,
  ROD_OUTLINE,
  ROD_OUTLINE_WIDTH,
  ROD_RIGHT,
  ROD_SHADES,
  ROD_SHADOW,
  ROD_SHADOW_DROP,
  ROD_TOP,
  SHADOW_DROP,
  SHADOW_RGB,
  SHADOW_STEPS,
  SHEET_RELIEF_STRENGTH,
  STRIP_RELIEF_STRENGTH,
  SURFACE_SEED,
  TONE_FOCUS_X,
  TONE_FOCUS_Y,
  TONE_REACH,
} from './constants'
import {
  paintBroadMottling,
  paintCreases,
  paintFibers,
  paintRelief,
  paintSpecks,
  type PaperArea,
} from './paperTexture'
import { TRACED_BACK_STRIP, TRACED_CREASES, TRACED_OUTLINE } from './sheetOutline'
import {
  boundsOf,
  foldLines,
  frameSheet,
  linePath,
  placeOnFrame,
  upwardFacing,
  type SheetFrame,
} from './sheetShape'

export interface EdgeTint {
  reachPixels: number
  tint: string
}

export interface ShadowStep {
  reachPixels: number
  opacity: number
}

type Shades = [number, string][]

function shadeAcross(
  context: CanvasRenderingContext2D,
  shades: Shades,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) {
  const gradient = context.createLinearGradient(fromX, fromY, toX, toY)
  for (const [offset, color] of shades) gradient.addColorStop(offset, color)
  return gradient
}

// ── Shadows ───────────────────────────────────────────────────────────────────
function strokeShadow(
  context: CanvasRenderingContext2D,
  outline: Path2D,
  rgb: string,
  steps: ShadowStep[],
  dropPixels: number
) {
  context.save()
  context.translate(0, dropPixels)
  context.lineJoin = 'round'
  for (const { reachPixels, opacity } of steps) {
    context.lineWidth = reachPixels * 2
    context.strokeStyle = `rgba(${rgb}, ${opacity})`
    context.stroke(outline)
  }
  context.restore()
}

function paintCastShadow(context: CanvasRenderingContext2D, onto: Path2D, from: Path2D) {
  context.save()
  context.clip(onto)
  strokeShadow(context, from, CAST_SHADOW_RGB, CAST_SHADOW_STEPS, 0)
  context.restore()
}

// ── Edges ─────────────────────────────────────────────────────────────────────
function paintEdgeTints(context: CanvasRenderingContext2D, outline: Path2D, tints: EdgeTint[]) {
  context.save()
  context.globalCompositeOperation = 'multiply'
  context.lineJoin = 'round'
  for (const { reachPixels, tint } of tints) {
    context.lineWidth = reachPixels * 2
    context.strokeStyle = tint
    context.stroke(outline)
  }
  context.restore()
}

function paintRim(context: CanvasRenderingContext2D, outlinePoints: number[]) {
  const levels = Array.from({ length: RIM_LEVELS }, () => new Path2D())
  const count = outlinePoints.length / 2
  for (let i = 0; i < count; i++) {
    const facing = (upwardFacing(outlinePoints, i) - RIM_FACING_MIN) / (1 - RIM_FACING_MIN)
    if (facing <= 0) continue
    const level = Math.min(RIM_LEVELS - 1, Math.floor(facing * RIM_LEVELS))
    const next = (i + 1) % count
    levels[level].moveTo(outlinePoints[i * 2], outlinePoints[i * 2 + 1])
    levels[level].lineTo(outlinePoints[next * 2], outlinePoints[next * 2 + 1])
  }

  context.save()
  context.lineWidth = RIM_WIDTH * 2
  context.lineCap = 'round'
  levels.forEach((level, index) => {
    context.strokeStyle = `rgba(${RIM_RGB}, ${(RIM_OPACITY * (index + 1)) / RIM_LEVELS})`
    context.stroke(level)
  })
  context.restore()
}

// ── Main sheet ────────────────────────────────────────────────────────────────
function paintTone(context: CanvasRenderingContext2D, area: PaperArea) {
  const focusX = area.left + area.width * TONE_FOCUS_X
  const focusY = area.top + area.height * TONE_FOCUS_Y
  const reach = Math.hypot(area.width, area.height) * TONE_REACH
  const tone = context.createRadialGradient(focusX, focusY, 0, focusX, focusY, reach)
  tone.addColorStop(0, PAPER_CENTER)
  tone.addColorStop(1, PAPER_EDGE)
  context.fillStyle = tone
  context.fillRect(area.left, area.top, area.width, area.height)
}

function paintBand(
  context: CanvasRenderingContext2D,
  outline: Path2D,
  frame: SheetFrame,
  outlinePoints: number[],
  area: PaperArea,
  random: Random,
  pixelRatio: number
) {
  const { crease, ridge } = foldLines(outlinePoints, frame, random)
  const band = new Path2D()
  band.addPath(outline)
  band.addPath(linePath(crease, true))

  context.save()
  context.clip(band, 'evenodd')
  context.globalCompositeOperation = 'multiply'
  context.fillStyle = BAND_TINT
  context.fillRect(area.left, area.top, area.width, area.height)
  context.globalCompositeOperation = 'source-over'
  paintRelief(context, area, pixelRatio, BAND_RELIEF_STRENGTH, area.width / 3)
  context.restore()

  context.save()
  context.lineWidth = FOLD_WIDTH
  context.lineJoin = 'round'
  context.strokeStyle = FOLD_DARK
  context.stroke(linePath(crease, true))
  context.strokeStyle = FOLD_LIGHT
  context.stroke(linePath(ridge, true))
  context.restore()
}

function paintSheet(
  context: CanvasRenderingContext2D,
  frame: SheetFrame,
  outline: Path2D,
  outlinePoints: number[],
  random: Random,
  pixelRatio: number
) {
  const area = boundsOf(outlinePoints)
  const creases = TRACED_CREASES.map((crease) => linePath(placeOnFrame(frame, crease), false))

  context.save()
  context.clip(outline)
  paintTone(context, area)
  paintBroadMottling(context, area, random)
  paintRelief(context, area, pixelRatio, SHEET_RELIEF_STRENGTH, 0)
  paintFibers(context, area, random)
  paintSpecks(context, area, random)
  paintBand(context, outline, frame, outlinePoints, area, random, pixelRatio)
  paintCreases(context, creases)
  paintEdgeTints(context, outline, EDGE_TINTS)
  paintRim(context, outlinePoints)
  context.restore()
}

// ── Back sheet ────────────────────────────────────────────────────────────────
function paintBackSheet(
  context: CanvasRenderingContext2D,
  frame: SheetFrame,
  sheetOutline: Path2D,
  pixelRatio: number
) {
  const stripPoints = placeOnFrame(frame, TRACED_BACK_STRIP)
  const strip = linePath(stripPoints, true)
  const area = boundsOf(stripPoints)
  const lightToShade: Shades = [
    [0, BACK_STRIP_LIT],
    [1, BACK_STRIP_SHADED],
  ]

  strokeShadow(context, strip, SHADOW_RGB, SHADOW_STEPS, SHADOW_DROP)
  context.save()
  context.clip(strip)
  context.fillStyle = shadeAcross(context, lightToShade, area.left, 0, area.left + area.width, 0)
  context.fillRect(area.left, area.top, area.width, area.height)
  paintRelief(context, area, pixelRatio, STRIP_RELIEF_STRENGTH, 0)
  paintEdgeTints(context, strip, BACK_STRIP_EDGE_TINTS)
  context.restore()
  paintCastShadow(context, strip, sheetOutline)
}

// ── Rod ───────────────────────────────────────────────────────────────────────
function roundedEnd(left: number, right: number, top: number, bottom: number) {
  const radius = (bottom - top) / 2
  const body = new Path2D()
  body.moveTo(right, top)
  body.lineTo(left + radius, top)
  body.arc(left + radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, true)
  body.lineTo(right, bottom)
  body.closePath()
  return body
}

function paintRodGrain(
  context: CanvasRenderingContext2D,
  left: number,
  right: number,
  top: number,
  bottom: number,
  random: Random
) {
  context.lineWidth = ROD_GRAIN_WIDTH
  context.strokeStyle = ROD_GRAIN
  for (let i = 0; i < ROD_GRAIN_LINES; i++) {
    const spread = (random() - 0.5) * ROD_GRAIN_SPREAD
    const y = mix(top, bottom, (i + 0.5 + spread) / ROD_GRAIN_LINES)
    const wobble = ROD_GRAIN_WOBBLE * (random() * 2 - 1)
    context.beginPath()
    context.moveTo(left, y)
    context.bezierCurveTo(
      mix(left, right, 1 / 3),
      y + wobble,
      mix(left, right, 2 / 3),
      y - wobble,
      right,
      y
    )
    context.stroke()
  }
}

function paintCollar(context: CanvasRenderingContext2D, frame: SheetFrame) {
  const [left, top, right, bottom] = placeOnFrame(frame, [
    COLLAR_LEFT,
    COLLAR_TOP,
    COLLAR_RIGHT,
    COLLAR_BOTTOM,
  ])
  const bandWidth = (right - left) / COLLAR_BANDS
  context.lineWidth = COLLAR_LINE_WIDTH
  for (let i = 0; i < COLLAR_BANDS; i++) {
    const bandLeft = left + i * bandWidth
    const highlightX = bandLeft + bandWidth * COLLAR_HIGHLIGHT_SHARE
    const band = new Path2D()
    band.roundRect(bandLeft, top, bandWidth, bottom - top, bandWidth / 2)
    context.fillStyle = shadeAcross(context, COLLAR_SHADES, 0, top, 0, bottom)
    context.fill(band)
    context.strokeStyle = COLLAR_HIGHLIGHT
    context.beginPath()
    context.moveTo(highlightX, top + COLLAR_HIGHLIGHT_INSET)
    context.lineTo(highlightX, bottom - COLLAR_HIGHLIGHT_INSET)
    context.stroke()
    context.strokeStyle = ROD_OUTLINE
    context.stroke(band)
  }
}

function paintRod(
  context: CanvasRenderingContext2D,
  frame: SheetFrame,
  sheetOutline: Path2D,
  random: Random
) {
  const [left, top, right, bottom] = placeOnFrame(frame, [ROD_LEFT, ROD_TOP, ROD_RIGHT, ROD_BOTTOM])
  const [knotX, knotY] = placeOnFrame(frame, [KNOT_X, KNOT_Y])
  const knotRadius = KNOT_RADIUS * frame.scale
  const body = roundedEnd(left, right, top, bottom)

  context.save()
  context.translate(0, ROD_SHADOW_DROP)
  context.fillStyle = ROD_SHADOW
  context.fill(body)
  context.restore()

  context.save()
  context.fillStyle = shadeAcross(context, ROD_SHADES, 0, top, 0, bottom)
  context.fill(body)
  context.clip(body)
  paintRodGrain(context, left, right, top, bottom, random)
  context.fillStyle = KNOT_COLOR
  context.beginPath()
  context.ellipse(knotX, knotY, knotRadius, knotRadius * KNOT_SQUASH, 0, 0, Math.PI * 2)
  context.fill()
  context.restore()

  context.save()
  context.lineWidth = ROD_OUTLINE_WIDTH
  context.strokeStyle = ROD_OUTLINE
  context.stroke(body)
  paintCollar(context, frame)
  context.restore()
  paintCastShadow(context, body, sheetOutline)
}

// ── Parchment ─────────────────────────────────────────────────────────────────
export const parchmentPixelRatio = () => Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)

export function paintParchment(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  pixelRatio: number
) {
  canvas.width = Math.round((width + PARCHMENT_MARGIN * 2) * pixelRatio)
  canvas.height = Math.round((height + PARCHMENT_MARGIN * 2) * pixelRatio)
  const context = canvas.getContext('2d')
  if (!context) return

  const margin = PARCHMENT_MARGIN * pixelRatio
  context.setTransform(pixelRatio, 0, 0, pixelRatio, margin, margin)
  const random = seededRandom(SURFACE_SEED)
  const frame = frameSheet(width, height)
  const outlinePoints = placeOnFrame(frame, TRACED_OUTLINE)
  const outline = linePath(outlinePoints, true)

  strokeShadow(context, outline, SHADOW_RGB, SHADOW_STEPS, SHADOW_DROP)
  paintBackSheet(context, frame, outline, pixelRatio)
  paintRod(context, frame, outline, random)
  paintSheet(context, frame, outline, outlinePoints, random, pixelRatio)
}
