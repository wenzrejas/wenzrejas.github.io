import * as THREE from 'three'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import {
  INK_GLINT_FADE_SECONDS,
  MONUMENT_NODE,
  SEAL_IMPACT_SECONDS,
  SEAL_LIFT,
  SEAL_LIFT_SECONDS,
  SEAL_SQUASH,
  SIGN_DELAY_SECONDS,
  SIGN_SECONDS,
  SIGNATURE_NODE,
  STAMP_AT_SECONDS,
  STAMP_SECONDS,
  WAX_SEAL_NODE,
} from './constants'
import { dressSignatureInk, updateInk, type InkUniforms } from './signingModel'

export interface Signing {
  monument: THREE.Object3D
  ink: InkUniforms
  seal: THREE.Object3D
  sealRest: THREE.Vector3
  sealNormal: THREE.Vector3
}

const { smoothstep, lerp } = THREE.MathUtils
const SIGN_END_SECONDS = SIGN_DELAY_SECONDS + SIGN_SECONDS
const STAMP_END_SECONDS = STAMP_AT_SECONDS + STAMP_SECONDS

export function prepareSigning(model: THREE.Object3D): Signing | null {
  const monument = nodeNamed(model, MONUMENT_NODE)
  const signature = nodeNamed(model, SIGNATURE_NODE)
  const seal = nodeNamed(model, WAX_SEAL_NODE)
  if (!monument || !signature || !seal) return null

  return {
    monument,
    ink: dressSignatureInk(meshesOf(signature)),
    seal,
    sealRest: seal.position.clone(),
    sealNormal: new THREE.Vector3(0, 1, 0).applyQuaternion(seal.quaternion),
  }
}

const inkReveal = ({ engagedSeconds, presence }: HoverTimeline) =>
  lerp(1, smoothstep(engagedSeconds, SIGN_DELAY_SECONDS, SIGN_END_SECONDS), presence)

const inkGlint = ({ engagedSeconds, presence }: HoverTimeline) =>
  engagedSeconds > SIGN_DELAY_SECONDS
    ? presence *
      (1 - smoothstep(engagedSeconds, SIGN_END_SECONDS, SIGN_END_SECONDS + INK_GLINT_FADE_SECONDS))
    : 0

const sealLift = ({ engagedSeconds, presence }: HoverTimeline) =>
  presence *
  smoothstep(engagedSeconds, 0, SEAL_LIFT_SECONDS) *
  (1 - smoothstep(engagedSeconds, STAMP_AT_SECONDS, STAMP_END_SECONDS))

function sealImpact({ engagedSeconds, presence }: HoverTimeline): number {
  const share = (engagedSeconds - STAMP_END_SECONDS) / SEAL_IMPACT_SECONDS
  return share > 0 && share < 1 ? presence * Math.sin(Math.PI * share) : 0
}

export const sealRingClock = ({ engagedSeconds }: HoverTimeline) =>
  engagedSeconds - STAMP_END_SECONDS

export function poseSigning(signing: Signing, hover: HoverTimeline): void {
  updateInk(signing.ink, inkReveal(hover), inkGlint(hover))
  signing.seal.position
    .copy(signing.sealRest)
    .addScaledVector(signing.sealNormal, sealLift(hover) * SEAL_LIFT)
  const squash = sealImpact(hover) * SEAL_SQUASH
  signing.seal.scale.set(1 + squash / 2, 1 - squash, 1 + squash / 2)
}
