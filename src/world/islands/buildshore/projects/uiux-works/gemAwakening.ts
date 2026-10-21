import * as THREE from 'three'
import { FULL_TURN } from '@/utils/math'
import { boundsIn, meshesOf, nodeNamed } from '@/utils/meshes'
import { timelineStage, type HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  GEM_BOB,
  GEM_BOB_RATE,
  GEM_GLOW_HOVER,
  GEM_LIFT,
  GEM_NODE,
  GEM_RISE_SECONDS,
  GEM_SPIN_RATE,
  INSET_PULSE,
  INSET_PULSE_RATE,
  PEDESTAL_INSET_NODE,
} from './constants'

export interface GemAwakening {
  gem: THREE.Mesh
  rest: THREE.Vector3
  spin: number
  inset: THREE.MeshStandardMaterial
  insetIntensity: number
  ringCentre: THREE.Vector3
}

export function findGemAwakening(model: THREE.Object3D): GemAwakening | null {
  const gemNode = nodeNamed(model, GEM_NODE)
  const insetNode = nodeNamed(model, PEDESTAL_INSET_NODE)
  if (!gemNode || !insetNode) return null

  model.updateMatrixWorld(true)
  const insetMesh = meshesOf(insetNode)[0]
  const inset = insetMesh.material as THREE.MeshStandardMaterial
  return {
    gem: meshesOf(gemNode)[0],
    rest: gemNode.position.clone(),
    spin: 0,
    inset,
    insetIntensity: inset.emissiveIntensity,
    ringCentre: boundsIn(model, [insetMesh]).getCenter(new THREE.Vector3()),
  }
}

export const gemLevel = (hover: HoverTimeline) => timelineStage(hover, GEM_RISE_SECONDS)

export const gemGlowLevel = (dayNight: number, hover: HoverTimeline) =>
  dayNight + GEM_GLOW_HOVER * gemLevel(hover)

export function poseGem(
  awakening: GemAwakening,
  hover: HoverTimeline,
  night: number,
  seconds: number,
  dt: number
): void {
  const level = gemLevel(hover)
  awakening.spin += GEM_SPIN_RATE * level * dt
  awakening.gem.rotation.y = awakening.spin
  awakening.gem.position.copy(awakening.rest)
  awakening.gem.position.y += level * (GEM_LIFT + Math.sin(seconds * GEM_BOB_RATE) * GEM_BOB)

  const pulse = 0.5 + 0.5 * Math.sin(seconds * INSET_PULSE_RATE * FULL_TURN)
  awakening.inset.emissiveIntensity =
    awakening.insetIntensity * (night + INSET_PULSE * pulse * level)
}
