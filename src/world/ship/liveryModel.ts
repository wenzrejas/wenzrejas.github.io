import * as THREE from 'three'
import { floatDefines } from '@/utils/glsl'
import { patchShader } from '@/world/islands/shared/materialPatch'
import {
  CANVAS_MATERIAL,
  LIVERY_ACCENT_REDNESS,
  LIVERY_ACCENT_REFERENCE,
  LIVERY_CLOTH_REFERENCE,
  LIVERY_CLOTH_WHITENESS,
  SHIP_LIVERIES,
  SURFACE_MATERIAL,
  type LiveryKey,
} from './constants'
import LIVERY_PARS from './shaders/liveryPars.frag.glsl'
import LIVERY from './shaders/livery.frag.glsl'

const liveryUniforms = {
  uIsLiveried: { value: false },
  uLiveryCloth: { value: new THREE.Color() },
  uLiveryAccent: { value: new THREE.Color() },
}

export function dressLivery(material: THREE.Material) {
  const isCanvas = material.name === CANVAS_MATERIAL
  if (!isCanvas && material.name !== SURFACE_MATERIAL) return
  patchShader(material, {
    uniforms: liveryUniforms,
    defines: {
      ...floatDefines({
        LIVERY_ACCENT_REDNESS,
        LIVERY_ACCENT_REFERENCE,
        LIVERY_CLOTH_WHITENESS,
        LIVERY_CLOTH_REFERENCE,
      }),
      ...(isCanvas ? {} : { LIVERY_ACCENT_ONLY: '' }),
    },
    fragment: { common: LIVERY_PARS, color_fragment: LIVERY },
  })
}

export function paintLivery(livery: LiveryKey) {
  const colors = SHIP_LIVERIES[livery]
  liveryUniforms.uIsLiveried.value = colors !== null
  if (!colors) return
  liveryUniforms.uLiveryCloth.value.set(colors.cloth)
  liveryUniforms.uLiveryAccent.value.set(colors.accent)
}
