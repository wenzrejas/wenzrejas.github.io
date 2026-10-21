import type * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { cloneLit, patchShader } from '@/world/islands/shared/materialPatch'
import COLOR_GLOW_PARS from './shaders/colorGlowPars.frag.glsl'
import COLOR_GLOW from './shaders/colorGlow.frag.glsl'

export interface ColorGlow {
  uColorGlow: { value: number }
}

const dressedMeshes = new WeakMap<THREE.Mesh, ColorGlow>()

export const createColorGlow = (): ColorGlow => ({ uColorGlow: { value: 0 } })

export const addColorGlow = (material: THREE.MeshStandardMaterial, glow: ColorGlow) =>
  patchShader(material, {
    uniforms: { ...glow },
    fragment: { common: COLOR_GLOW_PARS, emissivemap_fragment: COLOR_GLOW },
  })

export const dressColorGlow = (meshes: THREE.Mesh[], glow = createColorGlow()) =>
  onceFor(dressedMeshes, meshes[0], () => {
    const glowing = new Map<THREE.Material, THREE.MeshStandardMaterial>()
    for (const mesh of meshes) {
      const source = mesh.material as THREE.MeshStandardMaterial
      const material = glowing.get(source) ?? addColorGlow(cloneLit(source), glow)
      glowing.set(source, material)
      mesh.material = material
    }
    return glow
  })

export function setColorGlow(glow: ColorGlow, level: number): void {
  glow.uColorGlow.value = level
}
