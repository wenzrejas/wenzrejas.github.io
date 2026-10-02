import * as THREE from 'three'
import { boundsIn, displayColor, meshesOf } from '@/utils/meshes'
import { markerPositionOn } from '@/interaction/marker'
import type { GlowSite } from '../shared/ground-glow/glowSites'
import { dayNightGlow } from '../shared/nightGlow'
import {
  HIGHLIGHT_DAY_SHARE,
  LIGHTHOUSE_MARKER_HEIGHT,
  LIGHTHOUSE_NODE,
  SUMMIT_RING_NODE,
} from './constants'

export interface MainIsland {
  marker: THREE.Vector3
  summit: GlowSite
  hoverBlend: number
}

export function findMainIsland(model: THREE.Object3D): MainIsland | null {
  const lighthouse = model.getObjectByName(LIGHTHOUSE_NODE)
  const ring = model.getObjectByName(SUMMIT_RING_NODE)
  if (!lighthouse || !ring) return null

  model.updateMatrixWorld(true)
  const ringMeshes = meshesOf(ring)
  const ringBounds = boundsIn(model, ringMeshes)
  const ringSize = ringBounds.getSize(new THREE.Vector3())

  return {
    marker: markerPositionOn(model, lighthouse, LIGHTHOUSE_MARKER_HEIGHT),
    summit: {
      center: ringBounds.getCenter(new THREE.Vector3()).setY(ringBounds.max.y),
      radius: Math.max(ringSize.x, ringSize.z) / 2,
      color: displayColor(ringMeshes[0]),
    },
    hoverBlend: 0,
  }
}

export const highlightGlow = ({ hoverBlend }: MainIsland) =>
  hoverBlend * dayNightGlow(HIGHLIGHT_DAY_SHARE)
