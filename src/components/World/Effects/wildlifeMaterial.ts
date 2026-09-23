import * as THREE from 'three'
import { floatDefines } from '../../../utils/glsl'

interface WildlifeMaterialSpec {
  vertexGlsl: string
  fragmentGlsl: string
  deform: string
  fade?: string
  defines?: Record<string, number>
  uniforms?: Record<string, { value: number }>
}

export function createWildlifeMaterial({
  vertexGlsl,
  fragmentGlsl,
  deform,
  fade = 'aFade',
  defines,
  uniforms,
}: WildlifeMaterialSpec): THREE.MeshLambertMaterial {
  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
    side: THREE.DoubleSide,
    alphaHash: true,
  })

  if (defines) material.defines = floatDefines(defines)

  material.onBeforeCompile = (shader) => {
    if (uniforms) Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${vertexGlsl}`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\ntransformed = ${deform}(transformed);\nvFade = ${fade};`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${fragmentGlsl}`)
      .replace(
        '#include <alphahash_fragment>',
        'diffuseColor.a *= vFade;\n#include <alphahash_fragment>'
      )
  }

  return material
}

export function addInstancedFloats(
  geometry: THREE.BufferGeometry,
  names: string[],
  count: number
): void {
  for (const name of names) {
    geometry.setAttribute(
      name,
      new THREE.InstancedBufferAttribute(new Float32Array(count), 1).setUsage(
        THREE.DynamicDrawUsage
      )
    )
  }
}

export const depthFade = (depth: number, fadeFrom: number, hidden: number) =>
  1 - THREE.MathUtils.smoothstep(depth, fadeFrom, hidden)
