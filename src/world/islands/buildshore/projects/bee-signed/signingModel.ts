import * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { floatDefines } from '@/utils/glsl'
import { cloneLit, patchShader } from '@/world/islands/shared/materialPatch'
import { INK_GLINT_COLOR, INK_GLINT_REACH, INK_GLINT_STRENGTH } from './constants'
import INK_VERTEX_PARS from './shaders/inkRevealPars.vert.glsl'
import INK_VERTEX from './shaders/inkReveal.vert.glsl'
import INK_FRAGMENT_PARS from './shaders/inkRevealPars.frag.glsl'
import INK_CLIP from './shaders/inkClip.frag.glsl'
import INK_GLINT from './shaders/inkGlint.frag.glsl'

export interface InkUniforms {
  uReveal: { value: number }
  uGlint: { value: number }
  uInkLength: { value: number }
  uGlintColor: { value: THREE.Color }
}

const dressedSignatures = new WeakMap<THREE.Mesh, InkUniforms>()

function inkLengthOf(meshes: THREE.Mesh[]): number {
  let length = 0
  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute('position')
    for (let i = 0; i < position.count; i++) length = Math.max(length, position.getX(i))
  }
  return length
}

export const dressSignatureInk = (meshes: THREE.Mesh[]) =>
  onceFor(dressedSignatures, meshes[0], () => {
    const uniforms: InkUniforms = {
      uReveal: { value: 1 },
      uGlint: { value: 0 },
      uInkLength: { value: inkLengthOf(meshes) },
      uGlintColor: {
        value: new THREE.Color(INK_GLINT_COLOR).multiplyScalar(INK_GLINT_STRENGTH),
      },
    }
    const ink = patchShader(cloneLit(meshes[0].material as THREE.MeshStandardMaterial), {
      uniforms: { ...uniforms },
      defines: floatDefines({ INK_GLINT_REACH }),
      vertex: { common: INK_VERTEX_PARS, begin_vertex: INK_VERTEX },
      fragment: {
        common: INK_FRAGMENT_PARS,
        clipping_planes_fragment: INK_CLIP,
        emissivemap_fragment: INK_GLINT,
      },
    })
    for (const mesh of meshes) mesh.material = ink
    return uniforms
  })

export function updateInk(ink: InkUniforms, reveal: number, glint: number): void {
  ink.uReveal.value = reveal
  ink.uGlint.value = glint
}
