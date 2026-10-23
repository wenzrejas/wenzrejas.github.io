import type * as THREE from 'three'
import {
  PAGE_GLOW_HEIGHT,
  PAGE_GLOW_PULSE,
  PAGE_GLOW_PULSE_RATE,
  PAGE_GLOW_STRENGTH,
  PAGE_GLOW_WIDTH,
} from './constants'

export function glowSpread(
  material: THREE.ShaderMaterial,
  ruin: THREE.Object3D,
  time: number,
  strength: number
) {
  const pulse = 1 + PAGE_GLOW_PULSE * Math.sin(time * PAGE_GLOW_PULSE_RATE)
  material.uniforms.uSize.value.set(PAGE_GLOW_WIDTH, PAGE_GLOW_HEIGHT).multiplyScalar(ruin.scale.x)
  material.uniforms.uStrength.value = PAGE_GLOW_STRENGTH * strength * pulse
}
