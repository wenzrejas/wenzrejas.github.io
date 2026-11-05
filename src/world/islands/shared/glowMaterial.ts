import type * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { createAdditiveMaterial } from '@/utils/materials'

export function createAdditiveGlowMaterial(
  vertexShader: string,
  fragmentShader: string,
  defines: Record<string, number>,
  uniforms: Record<string, THREE.IUniform>
): THREE.ShaderMaterial {
  return createAdditiveMaterial({
    vertexShader,
    fragmentShader,
    defines: floatDefines(defines),
    uniforms: { uGlow: { value: 0 }, ...uniforms },
  })
}
