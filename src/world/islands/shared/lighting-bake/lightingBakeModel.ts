import * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { meshesOf, nodeNamed } from '@/utils/meshes'
import type { IslandModel } from '../islandModel'
import { cloneLit } from '../materialPatch'
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

export interface LampZone {
  node: string
  lampShare: number
  lampCeiling: number
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
  levels: LightingBakeLevels,
  lampCeiling?: number
): void {
  if (map) material.defines = { ...material.defines, LAMP_SPILL_RGB: '' }
  if (lampCeiling !== undefined) material.defines = { ...material.defines, LAMP_SPILL_CEILING: '' }
  const compileLit = material.onBeforeCompile

  material.onBeforeCompile = (shader, renderer) => {
    compileLit.call(material, shader, renderer)
    Object.assign(shader.uniforms, levels, {
      uBakedShadowStrength: { value: bake.overheadShadowStrength },
      uLampSpillLight: { value: light },
      uLampSpillCeiling: { value: lampCeiling },
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

function forkLampZone(island: IslandModel, zone: LampZone, zoneOf: Map<THREE.Material, LampZone>) {
  const root = nodeNamed(island.model, zone.node)
  if (!root) return

  const forks = new WeakMap<THREE.Material, THREE.MeshStandardMaterial>()
  for (const mesh of meshesOf(root)) {
    const tint = island.tints.find(({ material }) => material === mesh.material)
    if (!tint?.material.userData.lightingBake || !tint.material.aoMap) continue

    mesh.material = onceFor(forks, tint.material, () => {
      const fork = cloneLit(tint.material)
      zoneOf.set(fork, zone)
      island.tints.push({ material: fork, base: tint.base })
      return fork
    })
  }
}

export function bakeIslandLighting(
  island: IslandModel,
  lampCeiling?: number,
  lampZones: LampZone[] = []
): LightingBakeLevels {
  const existing = bakedIslands.get(island)
  if (existing) return existing

  const zoneOf = new Map<THREE.Material, LampZone>()
  for (const zone of lampZones) forkLampZone(island, zone, zoneOf)

  const levels: LightingBakeLevels = { uOverheadShadow: { value: 0 }, uLampSpill: { value: 0 } }
  for (const { material } of island.tints) {
    const bake = material.userData.lightingBake as LightingBake | undefined
    if (!bake || !material.aoMap) continue
    const spill = lampSpillOf(bake, island.loadTexture)
    if (!spill) continue
    const zone = zoneOf.get(material)
    if (zone) spill.light.multiplyScalar(zone.lampShare)
    applyBakedLighting(material, bake, spill, levels, zone?.lampCeiling ?? lampCeiling)
  }
  bakedIslands.set(island, levels)
  return levels
}
