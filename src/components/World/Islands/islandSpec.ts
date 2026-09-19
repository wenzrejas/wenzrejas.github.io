import type { ShoreTuning } from '../Shore/constants'

export interface IslandModelTuning {
  scale: number
  rotation: number
  offsetX: number
  offsetY: number
  offsetZ: number
  brightness: number
}

export interface CollisionCircle {
  x: number
  z: number
  radius: number
}

export interface ShoreRing {
  x: number
  z: number
  radius: number
  profile?: Float32Array
  options?: Partial<ShoreTuning>
}

export interface CalmBand {
  inner: number
  outer: number
}

export interface ContactBlob {
  spread: number
  y: number
  color: string
  opacity: number
}

export interface IslandSpec {
  tuning: IslandModelTuning
  footprint: number
  height: number
  collision: CollisionCircle[]
  shore: ShoreRing[]
  calm: CalmBand
  shoreOptions?: Partial<ShoreTuning>
}

export const BASE_TUNING: IslandModelTuning = {
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  brightness: 1.05,
}

export const modelUnits = (world: number, islandRadius: number, footprint: number) =>
  (world * footprint) / (islandRadius * 2)

export const modelToWorld = (islandRadius: number, footprint: number, scale: number) =>
  (islandRadius * 2 * scale) / footprint
