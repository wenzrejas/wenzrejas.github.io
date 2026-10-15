import * as THREE from 'three'
import type { IslandModel } from '../islandModel'
import LIGHTING_BAKE_PARS from './shaders/lightingBakePars.frag.glsl'
import OVERHEAD_SHADOW from './shaders/overheadShadow.frag.glsl'
import LAMP_SPILL from './shaders/lampSpill.frag.glsl'

interface LightingBake {
  overheadShadowStrength: number
  lampTint: [number, number, number]
  lampGain: number
  lampDecodeScale: number
}

export interface LightingBakeLevels {
  uOverheadShadow: { value: number }
  uLampSpill: { value: number }
}

const bakedIslands = new WeakMap<IslandModel, LightingBakeLevels>()

function applyBakedLighting(
  material: THREE.MeshStandardMaterial,
  bake: LightingBake,
  levels: LightingBakeLevels
): void {
  const spillLight = new THREE.Color()
    .fromArray(bake.lampTint)
    .multiplyScalar(bake.lampGain * bake.lampDecodeScale)
  const compileLit = material.onBeforeCompile

  material.onBeforeCompile = (shader, renderer) => {
    compileLit.call(material, shader, renderer)
    Object.assign(shader.uniforms, levels, {
      uBakedShadowStrength: { value: bake.overheadShadowStrength },
      uLampSpillLight: { value: spillLight },
    })
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
    if (bake && mat.aoMap) applyBakedLighting(mat, bake, levels)
  }
  bakedIslands.set(island, levels)
  return levels
}
