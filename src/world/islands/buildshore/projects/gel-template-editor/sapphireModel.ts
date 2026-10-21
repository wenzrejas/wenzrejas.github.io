import type * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { floatDefines } from '@/utils/glsl'
import { cloneLit, patchShader } from '@/world/islands/shared/materialPatch'
import {
  FACET_LIGHT_DIRECTION,
  FACET_SHADE_FLOOR,
  FACET_SHARPNESS,
  FACET_TILT_GAIN,
} from './constants'
import FACET_VERTEX_PARS from './shaders/sapphireFacetPars.vert.glsl'
import FACET_VERTEX from './shaders/sapphireFacet.vert.glsl'
import FACET_FRAGMENT_PARS from './shaders/sapphireFacetPars.frag.glsl'
import FACET_SHADE from './shaders/sapphireFacetShade.frag.glsl'
import FACET_GLOW from './shaders/sapphireGlow.frag.glsl'

export interface SapphireGlow {
  uSapphireGlow: { value: number }
}

const dressedSapphires = new WeakMap<THREE.Mesh, SapphireGlow>()
const [FACET_LIGHT_X, FACET_LIGHT_Y, FACET_LIGHT_Z] = FACET_LIGHT_DIRECTION

export const dressSapphire = (gem: THREE.Mesh) =>
  onceFor(dressedSapphires, gem, () => {
    const glow: SapphireGlow = { uSapphireGlow: { value: 0 } }
    gem.material = patchShader(cloneLit(gem.material as THREE.MeshStandardMaterial), {
      uniforms: { ...glow },
      defines: floatDefines({
        FACET_TILT_GAIN,
        FACET_SHARPNESS,
        FACET_SHADE_FLOOR,
        FACET_LIGHT_X,
        FACET_LIGHT_Y,
        FACET_LIGHT_Z,
      }),
      vertex: { common: FACET_VERTEX_PARS, beginnormal_vertex: FACET_VERTEX },
      fragment: {
        common: FACET_FRAGMENT_PARS,
        color_fragment: FACET_SHADE,
        emissivemap_fragment: FACET_GLOW,
      },
    })
    return glow
  })

export function glowSapphire(glow: SapphireGlow, level: number): void {
  glow.uSapphireGlow.value = level
}
