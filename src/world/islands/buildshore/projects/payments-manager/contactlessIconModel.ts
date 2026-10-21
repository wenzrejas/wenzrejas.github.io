import * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { floatDefines } from '@/utils/glsl'
import { meshesOf } from '@/utils/meshes'
import { cloneLit, patchShader } from '@/world/islands/shared/materialPatch'
import {
  ARC_FADE_SECONDS,
  ARC_FIRST_AT_SECONDS,
  ARC_STAGGER_SECONDS,
  ARC_TINT_COLOR,
  ARC_TINT_GLOW,
  INNER_ARC_EDGE,
  OUTER_ARC_EDGE,
  WAVE_CENTRE_X,
} from './constants'
import ARC_VERTEX_PARS from './shaders/contactlessArcsPars.vert.glsl'
import ARC_VERTEX from './shaders/contactlessArcs.vert.glsl'
import ARC_FRAGMENT_PARS from './shaders/contactlessArcsPars.frag.glsl'
import ARC_TINT from './shaders/contactlessArcsTint.frag.glsl'
import ARC_GLOW from './shaders/contactlessArcsGlow.frag.glsl'

export interface ContactlessArcs {
  uArcClock: { value: number }
  uArcLevel: { value: number }
  uArcColor: { value: THREE.Color }
}

const tintedIcons = new WeakMap<THREE.Mesh, ContactlessArcs>()

export function dressContactlessIcon(icon: THREE.Object3D): ContactlessArcs | null {
  const meshes = meshesOf(icon)
  if (meshes.length === 0) return null

  return onceFor(tintedIcons, meshes[0], () => {
    const arcs: ContactlessArcs = {
      uArcClock: { value: 0 },
      uArcLevel: { value: 0 },
      uArcColor: { value: new THREE.Color(ARC_TINT_COLOR) },
    }
    const material = patchShader(cloneLit(meshes[0].material as THREE.MeshStandardMaterial), {
      uniforms: { ...arcs },
      defines: floatDefines({
        ARC_FIRST_AT: ARC_FIRST_AT_SECONDS,
        ARC_STAGGER: ARC_STAGGER_SECONDS,
        ARC_FADE: ARC_FADE_SECONDS,
        ARC_GLOW: ARC_TINT_GLOW,
        WAVE_CENTRE_X,
        INNER_ARC_EDGE,
        OUTER_ARC_EDGE,
      }),
      vertex: { common: ARC_VERTEX_PARS, begin_vertex: ARC_VERTEX },
      fragment: {
        common: ARC_FRAGMENT_PARS,
        color_fragment: ARC_TINT,
        emissivemap_fragment: ARC_GLOW,
      },
    })
    for (const mesh of meshes) mesh.material = material
    return arcs
  })
}

export function lightContactlessArcs(arcs: ContactlessArcs, seconds: number, level: number): void {
  arcs.uArcClock.value = seconds
  arcs.uArcLevel.value = level
}
