import * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { floatDefines } from '@/utils/glsl'
import { cloneLit, patchShader } from '@/world/islands/shared/materialPatch'
import {
  COMET_COLOR,
  COMET_GLOW,
  COMET_HEAD_SHARE,
  COMET_TINT,
  COMET_TRAIL_SHARE,
} from './constants'
import LOOP_LIGHT_VERTEX_PARS from './shaders/loopLightPars.vert.glsl'
import LOOP_LIGHT_VERTEX from './shaders/loopLight.vert.glsl'
import LOOP_LIGHT_FRAGMENT_PARS from './shaders/loopLightPars.frag.glsl'
import LOOP_LIGHT_TINT from './shaders/loopLightTint.frag.glsl'
import LOOP_LIGHT_GLOW from './shaders/loopLightGlow.frag.glsl'

export interface LoopLightUniforms {
  uCometHead: { value: number }
  uCometLevel: { value: number }
  uCometColor: { value: THREE.Color }
}

const dressedLoops = new WeakMap<THREE.Mesh, LoopLightUniforms>()

export const dressLoopLight = (stones: THREE.Mesh[]) =>
  onceFor(dressedLoops, stones[0], () => {
    const uniforms: LoopLightUniforms = {
      uCometHead: { value: 0 },
      uCometLevel: { value: 0 },
      uCometColor: { value: new THREE.Color(COMET_COLOR) },
    }
    const stone = patchShader(cloneLit(stones[0].material as THREE.MeshStandardMaterial), {
      uniforms: { ...uniforms },
      defines: floatDefines({ COMET_TRAIL_SHARE, COMET_HEAD_SHARE, COMET_TINT, COMET_GLOW }),
      vertex: { common: LOOP_LIGHT_VERTEX_PARS, begin_vertex: LOOP_LIGHT_VERTEX },
      fragment: {
        common: LOOP_LIGHT_FRAGMENT_PARS,
        color_fragment: LOOP_LIGHT_TINT,
        emissivemap_fragment: LOOP_LIGHT_GLOW,
      },
    })
    for (const mesh of stones) mesh.material = stone
    return uniforms
  })

export function updateLoopLight(light: LoopLightUniforms, head: number, level: number): void {
  light.uCometHead.value = head
  light.uCometLevel.value = level
}
