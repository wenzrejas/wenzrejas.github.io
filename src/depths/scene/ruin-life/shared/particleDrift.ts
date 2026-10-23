import type * as THREE from 'three'
import { pointPixelScale } from '@/utils/screen'

export interface DriftTuning {
  count: number
  radiusMin: number
  radiusMax: number
  height: number
  rise: number
  orbit: number
  sway: number
  size: number
  strength: number
  color: string
}

export function driftParticles(
  material: THREE.ShaderMaterial,
  time: number,
  glow: number,
  camera: THREE.PerspectiveCamera,
  drawingHeight: number
) {
  const { uniforms } = material
  uniforms.uTime.value = time
  uniforms.uGlow.value = glow
  uniforms.uPixelScale.value = pointPixelScale(camera, drawingHeight)
}
