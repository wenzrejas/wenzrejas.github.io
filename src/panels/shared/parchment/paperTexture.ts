import { mix } from '@/utils/math'
import type { Random } from '@/utils/random'
import { addNoiseOctaves, noiseGrid } from '../procedural/valueNoise'
import {
  BROAD_MOTTLING_OCTAVES,
  BROAD_MOTTLING_PIXEL,
  BROAD_MOTTLING_STRENGTH,
  CREASE_DARK,
  CREASE_LIGHT,
  CREASE_LIGHT_OFFSET,
  CREASE_WIDTH,
  FIBER_BEND,
  FIBER_DARK,
  FIBER_LENGTH_MAX,
  FIBER_LENGTH_MIN,
  FIBER_LIGHT,
  FIBER_TILT,
  FIBER_WIDTH,
  FIBERS_PER_PIXEL,
  SPECK_CENTER_SHARE,
  SPECK_EDGE_FALLOFF,
  SPECK_OPACITY_MAX,
  SPECK_OPACITY_MIN,
  SPECK_RADIUS_MAX,
  SPECK_RADIUS_MIN,
  SPECK_RGB,
  SPECK_STRETCH_MAX,
  SPECKS_PER_PIXEL,
} from './constants'
import { greyShades, reliefShades, reliefTileSize } from './paperRelief'

export interface PaperArea {
  left: number
  top: number
  width: number
  height: number
}

const reliefTiles = new Map<number, HTMLCanvasElement>()

// ── Relief tile ───────────────────────────────────────────────────────────────
function shadeCanvas(shades: Uint8ClampedArray<ArrayBuffer>, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.putImageData(new ImageData(shades, width, height), 0, 0)
  return canvas
}

export function cacheReliefTile(pixelRatio: number, shades: Uint8ClampedArray<ArrayBuffer>) {
  if (!reliefTiles.has(pixelRatio)) {
    const size = reliefTileSize(pixelRatio)
    reliefTiles.set(pixelRatio, shadeCanvas(shades, size, size))
  }
  return reliefTiles.get(pixelRatio)!
}

const reliefTile = (pixelRatio: number) =>
  reliefTiles.get(pixelRatio) ?? cacheReliefTile(pixelRatio, reliefShades(pixelRatio))

export function paintBroadMottling(
  context: CanvasRenderingContext2D,
  area: PaperArea,
  random: Random
) {
  const grid = noiseGrid(
    Math.max(2, Math.ceil(area.width / BROAD_MOTTLING_PIXEL)),
    Math.max(2, Math.ceil(area.height / BROAD_MOTTLING_PIXEL))
  )
  addNoiseOctaves(grid, BROAD_MOTTLING_OCTAVES, random, area.width, area.height)
  context.save()
  context.globalCompositeOperation = 'soft-light'
  context.globalAlpha = BROAD_MOTTLING_STRENGTH
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    shadeCanvas(greyShades(grid, 0, random), grid.width, grid.height),
    area.left,
    area.top,
    grid.width * BROAD_MOTTLING_PIXEL,
    grid.height * BROAD_MOTTLING_PIXEL
  )
  context.restore()
}

export function paintRelief(
  context: CanvasRenderingContext2D,
  area: PaperArea,
  pixelRatio: number,
  strength: number,
  shiftPixels: number
) {
  const relief = context.createPattern(reliefTile(pixelRatio), 'repeat')
  if (!relief) return
  relief.setTransform(
    new DOMMatrix().translateSelf(shiftPixels, shiftPixels).scaleSelf(1 / pixelRatio)
  )
  context.save()
  context.globalCompositeOperation = 'soft-light'
  context.globalAlpha = strength
  context.fillStyle = relief
  context.fillRect(area.left, area.top, area.width, area.height)
  context.restore()
}

// ── Marks ─────────────────────────────────────────────────────────────────────
export function paintFibers(context: CanvasRenderingContext2D, area: PaperArea, random: Random) {
  const count = Math.round(area.width * area.height * FIBERS_PER_PIXEL)
  context.save()
  context.lineWidth = FIBER_WIDTH
  context.lineCap = 'round'
  for (let i = 0; i < count; i++) {
    const x = area.left + random() * area.width
    const y = area.top + random() * area.height
    const length = mix(FIBER_LENGTH_MIN, FIBER_LENGTH_MAX, random())
    const angle = (random() * 2 - 1) * FIBER_TILT
    const bend = (random() * 2 - 1) * FIBER_BEND * length
    const reachX = Math.cos(angle) * length
    const reachY = Math.sin(angle) * length
    context.strokeStyle = random() < 0.5 ? FIBER_DARK : FIBER_LIGHT
    context.beginPath()
    context.moveTo(x, y)
    context.quadraticCurveTo(
      x + reachX / 2 - Math.sin(angle) * bend,
      y + reachY / 2 + Math.cos(angle) * bend,
      x + reachX,
      y + reachY
    )
    context.stroke()
  }
  context.restore()
}

export function paintSpecks(context: CanvasRenderingContext2D, area: PaperArea, random: Random) {
  const count = Math.round(area.width * area.height * SPECKS_PER_PIXEL)
  context.save()
  for (let i = 0; i < count; i++) {
    const x = area.left + random() * area.width
    const y = area.top + random() * area.height
    const edgeGap = Math.min(
      x - area.left,
      area.left + area.width - x,
      y - area.top,
      area.top + area.height - y
    )
    const keepChance =
      SPECK_CENTER_SHARE + (1 - SPECK_CENTER_SHARE) * Math.exp(-edgeGap / SPECK_EDGE_FALLOFF)
    if (random() > keepChance) continue
    const radius = mix(SPECK_RADIUS_MIN, SPECK_RADIUS_MAX, random() ** 2)
    context.fillStyle = `rgba(${SPECK_RGB}, ${mix(SPECK_OPACITY_MIN, SPECK_OPACITY_MAX, random())})`
    context.beginPath()
    context.ellipse(
      x,
      y,
      radius * mix(1, SPECK_STRETCH_MAX, random()),
      radius,
      random() * Math.PI,
      0,
      Math.PI * 2
    )
    context.fill()
  }
  context.restore()
}

export function paintCreases(context: CanvasRenderingContext2D, creases: Path2D[]) {
  context.save()
  context.lineWidth = CREASE_WIDTH
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const crease of creases) {
    context.strokeStyle = CREASE_DARK
    context.stroke(crease)
    context.translate(CREASE_LIGHT_OFFSET, CREASE_LIGHT_OFFSET)
    context.strokeStyle = CREASE_LIGHT
    context.stroke(crease)
    context.translate(-CREASE_LIGHT_OFFSET, -CREASE_LIGHT_OFFSET)
  }
  context.restore()
}
