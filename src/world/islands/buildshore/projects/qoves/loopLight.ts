import type * as THREE from 'three'
import { meshesNamed, nodeNamed } from '@/utils/meshes'
import type { IslandModel } from '@/world/islands/shared/islandModel'
import type { GlowTarget } from '@/world/islands/shared/nightGlow'
import { timelineStage, type HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  AMBER_GLOW_MATERIAL,
  AMBER_GLOW_SWELL,
  COMET_TURN_RATE,
  LOOP_RISE_SECONDS,
  LOOP_STONE_NODES,
  QOVES_ROOT_NODE,
} from './constants'

export interface QovesLoop {
  frame: THREE.Object3D
  stones: THREE.Mesh[]
  amberGlow: GlowTarget | null
}

export function findQovesLoop(island: IslandModel): QovesLoop | null {
  const frame = nodeNamed(island.model, QOVES_ROOT_NODE)
  const stones = meshesNamed(island.model, LOOP_STONE_NODES)
  if (!frame || stones.length === 0) return null

  return {
    frame,
    stones,
    amberGlow: island.glows.find(({ mat }) => mat.name === AMBER_GLOW_MATERIAL) ?? null,
  }
}

export const loopLevel = (hover: HoverTimeline) => timelineStage(hover, LOOP_RISE_SECONDS)

export const cometHead = (hover: HoverTimeline) => -hover.engagedSeconds * COMET_TURN_RATE

export function swellAmberGlow(glow: GlowTarget, night: number, level: number): void {
  glow.mat.emissiveIntensity = glow.base * (night + AMBER_GLOW_SWELL * level)
}
