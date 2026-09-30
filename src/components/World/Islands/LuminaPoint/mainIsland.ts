import * as THREE from 'three'
import { boundsIn, displayColor, meshesOf } from '../../../../utils/meshes'
import type { GlowSite } from '../GroundGlow/glowSites'
import { dayNightGlow } from '../nightGlow'
import {
  BODY_HIT_SPREAD,
  HIGHLIGHT_DAY_SHARE,
  LIGHTHOUSE_NODE,
  MAIN_ISLAND_BODY_NODE,
  MAIN_ISLAND_NODE,
  SUMMIT_RING_NODE,
} from './constants'
import { LUMINA_MAIN_SHORE_RADIUS } from './shoreProfile'

interface HitBox {
  center: THREE.Vector3
  size: THREE.Vector3Tuple
}

export interface MainIsland {
  body: HitBox
  lighthouse: HitBox
  summit: GlowSite
  shore: GlowSite
  hoverBlend: number
}

function hitBoxAround(model: THREE.Object3D, node: THREE.Object3D, spread = 1): HitBox {
  const bounds = boundsIn(model, meshesOf(node))
  const size = bounds.getSize(new THREE.Vector3())
  return {
    center: bounds.getCenter(new THREE.Vector3()),
    size: [size.x * spread, size.y, size.z * spread],
  }
}

export function findMainIsland(model: THREE.Object3D): MainIsland | null {
  const island = model.getObjectByName(MAIN_ISLAND_NODE)
  const body = model.getObjectByName(MAIN_ISLAND_BODY_NODE)
  const lighthouse = model.getObjectByName(LIGHTHOUSE_NODE)
  const ring = model.getObjectByName(SUMMIT_RING_NODE)
  if (!island || !body || !lighthouse || !ring) return null

  model.updateMatrixWorld(true)
  const ringMeshes = meshesOf(ring)
  const ringBounds = boundsIn(model, ringMeshes)
  const ringSize = ringBounds.getSize(new THREE.Vector3())
  const color = displayColor(ringMeshes[0])

  return {
    body: hitBoxAround(model, body, BODY_HIT_SPREAD),
    lighthouse: hitBoxAround(model, lighthouse),
    summit: {
      center: ringBounds.getCenter(new THREE.Vector3()).setY(ringBounds.max.y),
      radius: Math.max(ringSize.x, ringSize.z) / 2,
      color,
    },
    shore: {
      center: model.worldToLocal(island.getWorldPosition(new THREE.Vector3())),
      radius: LUMINA_MAIN_SHORE_RADIUS,
      color,
    },
    hoverBlend: 0,
  }
}

export const highlightGlow = ({ hoverBlend }: MainIsland) =>
  hoverBlend * dayNightGlow(HIGHLIGHT_DAY_SHARE)
