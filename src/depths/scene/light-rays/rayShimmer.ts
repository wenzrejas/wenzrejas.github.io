import type * as THREE from 'three'

export function shimmerRays(material: THREE.ShaderMaterial, time: number) {
  material.uniforms.uTime.value = time
}
