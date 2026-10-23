import type * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { patchShader } from '@/world/islands/shared/materialPatch'
import { CUBE_ENAMEL_GLOW } from './constants'
import SEAM_BAND_VERTEX_PARS from './shaders/seamBandPars.vert.glsl'
import SEAM_BAND_VERTEX from './shaders/seamBand.vert.glsl'
import SEAM_BAND_FRAGMENT_PARS from './shaders/seamBandPars.frag.glsl'
import SEAM_BAND_FRAGMENT from './shaders/seamBand.frag.glsl'

export interface SeamBand {
  uBandY: { value: number }
  uBandWidth: { value: number }
  uBandGain: { value: number }
}

const bandedSeams = new WeakMap<THREE.Material, SeamBand>()
const ownRunes = new WeakMap<THREE.Mesh, THREE.Material>()
const glowingEnamels = new WeakMap<THREE.Material, boolean>()

export const bandSeams = (material: THREE.MeshStandardMaterial) =>
  onceFor(bandedSeams, material, () => {
    const band: SeamBand = {
      uBandY: { value: 0 },
      uBandWidth: { value: 1 },
      uBandGain: { value: 0 },
    }
    patchShader(material, {
      uniforms: { ...band },
      vertex: { common: SEAM_BAND_VERTEX_PARS, project_vertex: SEAM_BAND_VERTEX },
      fragment: { common: SEAM_BAND_FRAGMENT_PARS, emissivemap_fragment: SEAM_BAND_FRAGMENT },
    })
    return band
  })

export const glowEnamel = (material: THREE.MeshStandardMaterial) =>
  onceFor(glowingEnamels, material, () => {
    material.emissive.copy(material.color)
    material.emissiveIntensity = CUBE_ENAMEL_GLOW
    return true
  })

export const ownRuneMaterial = (mesh: THREE.Mesh) =>
  onceFor(ownRunes, mesh, () => {
    const runes = (mesh.material as THREE.Material).clone()
    mesh.material = runes
    return runes
  })
