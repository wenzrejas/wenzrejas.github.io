import * as THREE from 'three'
import { mix } from '@/utils/math'
import type { Random } from '@/utils/random'
import {
  BAND_REACH,
  BAND_SAMPLE_STEP,
  BAND_SMOOTHING,
  BAND_WANDER,
  BAND_WANDER_WAVELENGTH,
  FOLD_RIDGE_GAP,
  SHEET_CORNER_REACH,
} from './constants'
import { TRACED_SHEET_HEIGHT, TRACED_SHEET_WIDTH } from './sheetOutline'

export interface SheetFrame {
  scale: number
  height: number
}

const { smoothstep } = THREE.MathUtils

export const frameSheet = (width: number, height: number): SheetFrame => ({
  scale: width / TRACED_SHEET_WIDTH,
  height,
})

function frameY({ scale, height }: SheetFrame, y: number) {
  if (y <= SHEET_CORNER_REACH) return y * scale
  if (y >= TRACED_SHEET_HEIGHT - SHEET_CORNER_REACH)
    return height - (TRACED_SHEET_HEIGHT - y) * scale
  const stretch =
    (height - 2 * SHEET_CORNER_REACH * scale) / (TRACED_SHEET_HEIGHT - 2 * SHEET_CORNER_REACH)
  return SHEET_CORNER_REACH * scale + (y - SHEET_CORNER_REACH) * stretch
}

export function placeOnFrame(frame: SheetFrame, traced: readonly number[]) {
  const placed = new Array<number>(traced.length)
  for (let i = 0; i < traced.length; i += 2) {
    placed[i] = traced[i] * frame.scale
    placed[i + 1] = frameY(frame, traced[i + 1])
  }
  return placed
}

export function linePath(points: readonly number[], isClosed: boolean) {
  const path = new Path2D()
  path.moveTo(points[0], points[1])
  for (let i = 2; i < points.length; i += 2) path.lineTo(points[i], points[i + 1])
  if (isClosed) path.closePath()
  return path
}

export function boundsOf(points: readonly number[]) {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (let i = 0; i < points.length; i += 2) {
    left = Math.min(left, points[i])
    right = Math.max(right, points[i])
    top = Math.min(top, points[i + 1])
    bottom = Math.max(bottom, points[i + 1])
  }
  return { left, top, width: right - left, height: bottom - top }
}

function resampleLoop(points: readonly number[], spacing: number) {
  const count = points.length / 2
  const samples: number[] = []
  let carried = 0
  for (let i = 0; i < count; i++) {
    const startX = points[i * 2]
    const startY = points[i * 2 + 1]
    const endX = points[((i + 1) % count) * 2]
    const endY = points[((i + 1) % count) * 2 + 1]
    const length = Math.hypot(endX - startX, endY - startY)
    let along = carried
    while (along < length) {
      const share = along / length
      samples.push(mix(startX, endX, share), mix(startY, endY, share))
      along += spacing
    }
    carried = along - length
  }
  return samples
}

function smoothLoop(points: readonly number[], window: number) {
  const count = points.length / 2
  const reach = Math.floor(window / 2)
  const smoothed = new Array<number>(points.length)
  for (let i = 0; i < count; i++) {
    let sumX = 0
    let sumY = 0
    for (let offset = -reach; offset <= reach; offset++) {
      const neighbour = (i + offset + count) % count
      sumX += points[neighbour * 2]
      sumY += points[neighbour * 2 + 1]
    }
    smoothed[i * 2] = sumX / (reach * 2 + 1)
    smoothed[i * 2 + 1] = sumY / (reach * 2 + 1)
  }
  return smoothed
}

function wanderAround(count: number, knotCount: number, random: Random) {
  const knots = Array.from({ length: knotCount }, () => (random() * 2 - 1) * BAND_WANDER)
  return Array.from({ length: count }, (_, i) => {
    const position = (i / count) * knotCount
    const knot = Math.floor(position)
    const blend = smoothstep(position - knot, 0, 1)
    return mix(knots[knot % knotCount], knots[(knot + 1) % knotCount], blend)
  })
}

export function foldLines(outline: readonly number[], frame: SheetFrame, random: Random) {
  const spacing = BAND_SAMPLE_STEP * frame.scale
  const loop = smoothLoop(resampleLoop(outline, spacing), BAND_SMOOTHING)
  const count = loop.length / 2
  const knotCount = Math.max(3, Math.round((count * BAND_SAMPLE_STEP) / BAND_WANDER_WAVELENGTH))
  const wander = wanderAround(count, knotCount, random)
  const crease = new Array<number>(loop.length)
  const ridge = new Array<number>(loop.length)

  for (let i = 0; i < count; i++) {
    const previous = (i - 1 + count) % count
    const next = (i + 1) % count
    const tangentX = loop[next * 2] - loop[previous * 2]
    const tangentY = loop[next * 2 + 1] - loop[previous * 2 + 1]
    const length = Math.hypot(tangentX, tangentY) || 1
    const inwardX = -tangentY / length
    const inwardY = tangentX / length
    const inset = (BAND_REACH + wander[i]) * frame.scale
    crease[i * 2] = loop[i * 2] + inwardX * inset
    crease[i * 2 + 1] = loop[i * 2 + 1] + inwardY * inset
    ridge[i * 2] = crease[i * 2] + inwardX * FOLD_RIDGE_GAP
    ridge[i * 2 + 1] = crease[i * 2 + 1] + inwardY * FOLD_RIDGE_GAP
  }

  return { crease, ridge }
}

export function upwardFacing(points: readonly number[], index: number) {
  const count = points.length / 2
  const next = (index + 1) % count
  const alongX = points[next * 2] - points[index * 2]
  const alongY = points[next * 2 + 1] - points[index * 2 + 1]
  return alongX / (Math.hypot(alongX, alongY) || 1)
}
