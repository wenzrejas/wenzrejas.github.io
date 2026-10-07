import { useMemo } from 'react'
import { rand } from '@/utils/math'
import type { ShoreField } from '@/world/shore/shoreField'
import type { IslandPlacement } from './islandTransform'

export interface SiteFrame {
  originX: number
  originZ: number
  facing: number
  scale: number
}

// ── Frame ─────────────────────────────────────────────────────────────────────

export function useSiteFrame({ position, rotation, scale }: IslandPlacement): SiteFrame {
  const [originX, , originZ] = position
  const facing = rotation[1]
  return useMemo(() => ({ originX, originZ, facing, scale }), [originX, originZ, facing, scale])
}

export function turnToIsland(frame: SiteFrame, x: number, z: number): [number, number] {
  const cos = Math.cos(frame.facing)
  const sin = Math.sin(frame.facing)
  return [x * cos + z * sin, z * cos - x * sin]
}

export function placeOnIsland(frame: SiteFrame, x: number, z: number): [number, number] {
  const [turnedX, turnedZ] = turnToIsland(frame, x, z)
  return [frame.originX + turnedX * frame.scale, frame.originZ + turnedZ * frame.scale]
}

export function scanShore(
  shoreline: ShoreField,
  step: number,
  visit: (x: number, z: number, cell: number) => void
): void {
  const { resolution, size, centerX, centerZ } = shoreline
  for (let row = 1; row < resolution - 1; row += step) {
    for (let column = 1; column < resolution - 1; column += step) {
      visit(
        centerX + ((column + 0.5) / resolution - 0.5) * size,
        centerZ + ((row + 0.5) / resolution - 0.5) * size,
        row * resolution + column
      )
    }
  }
}

// ── Bursts ────────────────────────────────────────────────────────────────────

export function burstsDue(clock: { wait: number }, dt: number, min: number, max: number): number {
  clock.wait -= dt
  let bursts = 0
  while (clock.wait <= 0) {
    clock.wait += rand(min, max)
    bursts++
  }
  return bursts
}

export const pickSite = <T>(sites: T[]) => sites[Math.floor(Math.random() * sites.length)]
