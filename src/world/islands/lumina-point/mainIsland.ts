import * as THREE from 'three'
import { boundsIn, displayColor, meshesOf, positionIn } from '@/utils/meshes'
import { footprintGap, footprintOf } from '@/interaction/baseFootprint'
import { isEngaged } from '@/interaction/hover'
import { markerPositionOn } from '@/interaction/marker'
import type { GlowSite } from '../shared/ground-glow/glowSites'
import { dayNightGlow } from '../shared/nightGlow'
import {
  HIGHLIGHT_DAY_SHARE,
  LIGHTHOUSE_MARKER_HEIGHT,
  LIGHTHOUSE_NODE,
  MAIN_ISLAND_NODE,
  SUMMIT_RING_NODE,
} from './constants'
import { LUMINA_MAIN_SHORE_RADIUS } from './shoreProfile'

export interface MainIsland {
  marker: THREE.Vector3
  summit: GlowSite
  baseGap: (x: number, z: number) => number
  isHovered: boolean
  hoverBlend: number
}

export function findMainIsland(model: THREE.Object3D): MainIsland | null {
  const lighthouse = model.getObjectByName(LIGHTHOUSE_NODE)
  const ring = model.getObjectByName(SUMMIT_RING_NODE)
  const land = model.getObjectByName(MAIN_ISLAND_NODE)
  if (!lighthouse || !ring || !land) return null

  model.updateMatrixWorld(true)
  const ringMeshes = meshesOf(ring)
  const ringBounds = boundsIn(model, ringMeshes)
  const ringSize = ringBounds.getSize(new THREE.Vector3())
  const shore = footprintOf(
    model,
    meshesOf(land),
    positionIn(model, land),
    LUMINA_MAIN_SHORE_RADIUS
  )

  return {
    marker: markerPositionOn(model, lighthouse, LIGHTHOUSE_MARKER_HEIGHT),
    summit: {
      center: ringBounds.getCenter(new THREE.Vector3()).setY(ringBounds.max.y),
      radius: Math.max(ringSize.x, ringSize.z) / 2,
      color: displayColor(ringMeshes[0]),
    },
    baseGap: (x, z) => footprintGap(shore, model, x, z),
    isHovered: false,
    hoverBlend: 0,
  }
}

export const isMainIslandEngaged = ({ isHovered }: MainIsland) => isEngaged(isHovered, 'contact')

export const highlightGlow = ({ hoverBlend }: MainIsland) =>
  hoverBlend * dayNightGlow(HIGHLIGHT_DAY_SHARE)
