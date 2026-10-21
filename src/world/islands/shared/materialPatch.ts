import type * as THREE from 'three'
import { applyCloudShadow } from '@/world/environment/weather/cloudShadow'

export interface ShaderPatch {
  uniforms: Record<string, THREE.IUniform>
  defines?: Record<string, string>
  vertex?: Record<string, string>
  fragment?: Record<string, string>
}

const insertAfterChunks = (source: string, chunks: Record<string, string>) =>
  Object.entries(chunks).reduce(
    (code, [chunk, addition]) =>
      code.replace(`#include <${chunk}>`, `#include <${chunk}>\n${addition}`),
    source
  )

export function cloneLit<T extends THREE.Material>(material: T): T {
  const clone = material.clone() as T
  applyCloudShadow(clone)
  return clone
}

export function patchShader<T extends THREE.MeshStandardMaterial>(
  material: T,
  { uniforms, defines, vertex = {}, fragment = {} }: ShaderPatch
): T {
  if (defines) material.defines = { ...material.defines, ...defines }
  const compileLit = material.onBeforeCompile
  const programCacheKey = material.customProgramCacheKey() + JSON.stringify([vertex, fragment])

  material.onBeforeCompile = (shader, renderer) => {
    compileLit.call(material, shader, renderer)
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = insertAfterChunks(shader.vertexShader, vertex)
    shader.fragmentShader = insertAfterChunks(shader.fragmentShader, fragment)
  }
  material.customProgramCacheKey = () => programCacheKey
  material.needsUpdate = true
  return material
}
