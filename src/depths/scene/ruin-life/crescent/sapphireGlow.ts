import * as THREE from 'three'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import type { HaloGem } from '@/world/islands/shared/gem-halo/gemHaloModel'
import type { SparkleGem } from '@/world/islands/shared/gem-sparkles/sparkleSpots'
import { RUIN_STONE_MATERIAL } from '@/depths/scene/sunken-ruins/constants'
import { glintGemAt } from '../shared/glintFlash'
import { glowLevelsOf, shineGlow, type GlowLevel } from '../shared/glowLevels'
import { haloAround } from '../shared/haloGlow'
import { materialNameOf, ruinPoints } from '../shared/ruinPoints'
import { wakeGlow } from '../shared/ruinWake'
import {
  CRESCENT_EDGE_FARTHEST,
  CRESCENT_EDGE_NEAREST,
  CRESCENT_EDGE_SLAB,
  CRESCENT_GLINTS,
  SAPPHIRE_HALO_COLOR,
  SAPPHIRE_MOON,
  SAPPHIRE_PULSE,
  SAPPHIRE_PULSE_RATE,
} from './constants'

export interface SapphireMoon {
  sapphire: GlowLevel[]
  halos: HaloGem[]
  glintGem: SparkleGem
}

export function findSapphireMoon(ruin: THREE.Object3D): SapphireMoon {
  const sapphire = nodeNamed(ruin, SAPPHIRE_MOON)
  const hub = sapphire ? sapphire.position.clone() : new THREE.Vector3()
  const edge = ruinPoints(
    ruin,
    (mesh) => materialNameOf(mesh).startsWith(RUIN_STONE_MATERIAL),
    (point) => {
      const reach = Math.hypot(point.x - hub.x, point.y - hub.y)
      return (
        Math.abs(point.z - hub.z) < CRESCENT_EDGE_SLAB &&
        reach >= CRESCENT_EDGE_NEAREST &&
        reach <= CRESCENT_EDGE_FARTHEST
      )
    }
  )
  return {
    sapphire: sapphire ? glowLevelsOf(meshesOf(sapphire)) : [],
    halos: sapphire ? [haloAround(ruin, sapphire, SAPPHIRE_HALO_COLOR)] : [],
    glintGem: glintGemAt(ruin, edge, CRESCENT_GLINTS),
  }
}

export const pulseSapphire = ({ sapphire }: SapphireMoon, time: number, wake: number) =>
  shineGlow(sapphire, wakeGlow(wake) * (1 + SAPPHIRE_PULSE * Math.sin(time * SAPPHIRE_PULSE_RATE)))
