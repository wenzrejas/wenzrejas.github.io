import type * as THREE from 'three'

export function pulseJellyfish(material: THREE.ShaderMaterial, time: number) {
  material.uniforms.uTime.value = time
}
