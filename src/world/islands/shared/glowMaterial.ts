import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'

export function createAdditiveGlowMaterial(
  vertexShader: string,
  fragmentShader: string,
  defines: Record<string, number>,
  uniforms: Record<string, THREE.IUniform>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: floatDefines(defines),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uGlow: { value: 0 }, ...uniforms },
  })
}
