import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import {
  CHARGE_MOTE_SIZE,
  ORB_HALO,
  ORB_RADIUS,
  RISING_MOTES,
  SKY_BEAM_HEIGHT,
  SKY_BEAM_RADIUS,
} from './constants'
import type { SkyBeamStage } from './skyBeamSequence'

interface SkyBeamParts {
  arcs: THREE.Mesh
  chargeMotes: THREE.Points
  risingMotes: THREE.Points
  orb: THREE.Mesh
  beam: THREE.Mesh
  shockRing: THREE.Mesh
}

export function paintSkyBeam(
  { arcs, chargeMotes, risingMotes, orb, beam, shockRing }: SkyBeamParts,
  stage: SkyBeamStage,
  elapsed: number,
  unitPixels: number,
  islandScale: number
) {
  arcs.visible = stage.sparks > 0
  uniformsOf(arcs).uGlow.value = stage.sparks

  chargeMotes.visible = stage.motes > 0
  const chargeUniforms = uniformsOf(chargeMotes)
  chargeUniforms.uGlow.value = stage.motes
  chargeUniforms.uTime.value = elapsed
  chargeUniforms.uSize.value = CHARGE_MOTE_SIZE * unitPixels

  risingMotes.visible = stage.risingMotes > 0
  const risingUniforms = uniformsOf(risingMotes)
  ;(risingUniforms.uGlow.value as number[])[0] = stage.risingMotes
  risingUniforms.uTime.value = elapsed
  risingUniforms.uSize.value = RISING_MOTES.moteSize * unitPixels
  risingUniforms.uRise.value = RISING_MOTES.moteRise / islandScale

  orb.visible = stage.orbSize > 0
  const orbUniforms = uniformsOf(orb)
  orbUniforms.uGlow.value = stage.orbGlow
  orbUniforms.uSize.value = ORB_RADIUS * ORB_HALO * stage.orbSize
  orbUniforms.uTime.value = elapsed

  beam.visible = stage.reach > 0
  const beamRadius = SKY_BEAM_RADIUS * stage.beamWidth
  beam.scale.set(beamRadius, SKY_BEAM_HEIGHT * stage.reach, beamRadius)
  const beamUniforms = uniformsOf(beam)
  beamUniforms.uGlow.value = stage.beamGlow
  beamUniforms.uLength.value = SKY_BEAM_HEIGHT * stage.reach
  beamUniforms.uTime.value = elapsed

  shockRing.visible = stage.ringGlow > 0
  shockRing.scale.setScalar(stage.ringRadius * 2)
  uniformsOf(shockRing).uGlow.value = stage.ringGlow
}
