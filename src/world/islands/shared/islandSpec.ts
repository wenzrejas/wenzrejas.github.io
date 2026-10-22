import type { ShoreTuning } from '@/world/shore/constants'

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

export interface ContactBlob {
  spread: number
  y: number
  color: string
  opacity: number
}

interface Mooring {
  x: number
  z: number
  headingDegrees: number
}

export interface IslandSpec {
  tuning: IslandModelTuning
  footprint: number
  height: number
  collision: CollisionCircle[]
  shore: ShoreRing[]
  shoreOptions?: Partial<ShoreTuning>
  mooring?: Mooring
  revealLead?: number
  screenTop?: number
}

export const BASE_TUNING: IslandModelTuning = {
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  brightness: 1.05,
}

export const islandLocalY = (worldY: number, islandScale: number, offsetY: number) =>
  (worldY - offsetY) / islandScale

export const modelToWorld = (islandRadius: number, footprint: number, scale: number) =>
  (islandRadius * 2 * scale) / footprint
