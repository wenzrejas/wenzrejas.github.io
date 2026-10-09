import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import { boundsIn, meshesOf, pointIn, positionIn } from '@/utils/meshes'
import {
  BEAM_ANCHOR_FORWARD,
  BEAM_ANCHOR_NODE,
  BEAM_HEAD_NODE,
  BEAM_LENS_NODE,
  BEAM_STRENGTH,
  BEAM_SUN_FULL,
  BEAM_SUN_ON,
} from './constants'

export function rigBeam(model: THREE.Object3D) {
  const anchor = model.getObjectByName(BEAM_ANCHOR_NODE)
  const head = model.getObjectByName(BEAM_HEAD_NODE)
  const lens = model.getObjectByName(BEAM_LENS_NODE)
  if (!anchor || !head || !lens) return null

  model.updateMatrixWorld(true)
  const origin = positionIn(model, anchor)
  const facing = pointIn(model, anchor, BEAM_ANCHOR_FORWARD).sub(origin)
  const pivot = positionIn(model, head).setY(origin.y)
  const lensSize = boundsIn(lens, meshesOf(lens)).getSize(new THREE.Vector3())

  return {
    pivot,
    lensOffset: origin.sub(pivot),
    lensRadius: Math.max(lensSize.x, lensSize.y, lensSize.z) / 2,
    restYaw: Math.atan2(-facing.z, facing.x),
    head,
    headRest: head.rotation.y,
  }
}

export function aimHead(head: THREE.Object3D, yaw: number) {
  head.rotation.y = yaw
}

export function beamLevel(): number {
  const sunHeight = useCycleStore.getState().clockSunHeight
  const skyBeamPresence = useSkyBeamStore.getState().presence
  const daylight = THREE.MathUtils.smoothstep(sunHeight, BEAM_SUN_FULL, BEAM_SUN_ON)
  return (1 - daylight) * (1 - skyBeamPresence) * BEAM_STRENGTH
}
