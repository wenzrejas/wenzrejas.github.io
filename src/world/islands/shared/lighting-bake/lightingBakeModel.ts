import * as THREE from 'three'
import type { IslandModel } from '../islandModel'
import LIGHTING_BAKE_PARS from './shaders/lightingBakePars.frag.glsl'
import OVERHEAD_SHADOW from './shaders/overheadShadow.frag.glsl'
import LAMP_SPILL from './shaders/lampSpill.frag.glsl'

const PACKED_LAMP_ENCODING = 'sqrt_normalized_irradiance'
const RGB_LAMP_ENCODING = 'sqrt_peak_normalized_rgb_irradiance'

interface LightingBake {
  overheadShadowStrength: number
  lampEncoding: string
  lampGain: number
  lampDecodeScale: number
  lampTint?: [number, number, number]
  sourceLampDecodeScale?: number
  nightSpillTexture?: { index: number }
}

interface LampSpill {
  light: THREE.Color
  map: { value: THREE.Texture | null } | null
}

export interface LightingBakeLevels {
  uOverheadShadow: { value: number }
  uLampSpill: { value: number }
}

const bakedIslands = new WeakMap<IslandModel, LightingBakeLevels>()

function lampSpillOf(
  bake: LightingBake,
  loadTexture: IslandModel['loadTexture']
): LampSpill | null {
  if (bake.lampEncoding === PACKED_LAMP_ENCODING && bake.lampTint) {
    const light = new THREE.Color()
      .fromArray(bake.lampTint)
      .multiplyScalar(bake.lampGain * bake.lampDecodeScale)
    return { light, map: null }
  }

  const { nightSpillTexture, sourceLampDecodeScale } = bake
  if (bake.lampEncoding === RGB_LAMP_ENCODING && nightSpillTexture && sourceLampDecodeScale) {
    const map = { value: null as THREE.Texture | null }
    void loadTexture(nightSpillTexture.index).then((texture) => {
      map.value = texture
    })
    return { light: new THREE.Color().setScalar(sourceLampDecodeScale * bake.lampGain), map }
  }
  return null
}

function applyBakedLighting(
  material: THREE.MeshStandardMaterial,
  bake: LightingBake,
  { light, map }: LampSpill,
  levels: LightingBakeLevels
): void {
  if (map) material.defines = { ...material.defines, LAMP_SPILL_RGB: '' }
  const compileLit = material.onBeforeCompile

  material.onBeforeCompile = (shader, renderer) => {
    compileLit.call(material, shader, renderer)
    Object.assign(shader.uniforms, levels, {
      uBakedShadowStrength: { value: bake.overheadShadowStrength },
      uLampSpillLight: { value: light },
    })
    if (map) shader.uniforms.uLampSpillMap = map
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${LIGHTING_BAKE_PARS}`)
      .replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>\n${OVERHEAD_SHADOW}`
      )
      .replace('#include <tonemapping_fragment>', `${LAMP_SPILL}\n#include <tonemapping_fragment>`)
  }
  material.needsUpdate = true
}

export function bakeIslandLighting(island: IslandModel): LightingBakeLevels {
  const existing = bakedIslands.get(island)
  if (existing) return existing

  const levels: LightingBakeLevels = { uOverheadShadow: { value: 0 }, uLampSpill: { value: 0 } }
  for (const { mat } of island.tints) {
    const bake = mat.userData.lightingBake as LightingBake | undefined
    if (!bake || !mat.aoMap) continue
    const spill = lampSpillOf(bake, island.loadTexture)
    if (spill) applyBakedLighting(mat, bake, spill, levels)
  }
  bakedIslands.set(island, levels)
  return levels
}
