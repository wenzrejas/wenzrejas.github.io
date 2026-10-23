import type * as THREE from 'three'
import { pointPixelScale } from '@/utils/screen'

export function driftMotes(
  material: THREE.ShaderMaterial,
  camera: THREE.PerspectiveCamera,
  drawingHeight: number,
  time: number
) {
  material.uniforms.uTime.value = time
  material.uniforms.uPixelScale.value = pointPixelScale(camera, drawingHeight)
}
