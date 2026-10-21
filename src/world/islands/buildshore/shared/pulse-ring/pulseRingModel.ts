import * as THREE from 'three'
import UV_QUAD_VERT from '@/shaders/uvQuad.vert.glsl'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import { PULSE_GLOW_SPREAD, PULSE_TRAIL_STRENGTH } from './constants'
import PULSE_RING_FRAG from './shaders/pulseRing.frag.glsl'

export interface PulseRingTuning {
  color: string
  periodSeconds: number
  rings: number
  isRepeating: boolean
  width: number
  trail: number
  lift: number
  glow: number
}

const createRingMaterial = (
  tuning: PulseRingTuning,
  defines: Record<string, number>,
  blending: THREE.Blending
) =>
  new THREE.ShaderMaterial({
    vertexShader: UV_QUAD_VERT,
    fragmentShader: PULSE_RING_FRAG,
    defines: floatDefines(defines),
    transparent: true,
    depthWrite: false,
    blending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: displayColorOf(tuning.color) },
      uPresence: { value: 0 },
      uClock: { value: 0 },
      uPeriod: { value: tuning.periodSeconds },
      uWidth: { value: tuning.width },
      uTrail: { value: tuning.trail },
      uRings: { value: tuning.rings },
      uRepeat: { value: tuning.isRepeating ? 1 : 0 },
    },
  })

export const createPulseRingMaterial = (tuning: PulseRingTuning) =>
  createRingMaterial(tuning, { TRAIL_STRENGTH: PULSE_TRAIL_STRENGTH }, THREE.NormalBlending)

export function updatePulseRing(
  materials: THREE.ShaderMaterial[],
  presence: number,
  clock: number
): void {
  for (const { uniforms } of materials) {
    uniforms.uPresence.value = presence
    uniforms.uClock.value = clock
  }
}

export const createPulseGlowMaterial = (tuning: PulseRingTuning) =>
  createRingMaterial(
    tuning,
    { TRAIL_STRENGTH: 0, GLOW_SPREAD: PULSE_GLOW_SPREAD, GLOW_STRENGTH: tuning.glow },
    THREE.AdditiveBlending
  )
