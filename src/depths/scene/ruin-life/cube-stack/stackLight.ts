import * as THREE from 'three'
import { mix } from '@/utils/math'
import { meshesOf } from '@/utils/meshes'
import type { HaloGem } from '@/world/islands/shared/gem-halo/gemHaloModel'
import { glowLevelsOf, shineGlow, type GlowLevel } from '../shared/glowLevels'
import { haloAround } from '../shared/haloGlow'
import { materialNameOf, ruinBounds } from '../shared/ruinPoints'
import { wakeGlow, wakeStrength } from '../shared/ruinWake'
import {
  CUBE_GLOW_BREATH,
  CUBE_GLOW_BREATH_RATE,
  CUBE_HALO_COLOR,
  ENAMEL_MATERIAL_MARK,
  RUNE_FLARE,
  RUNE_FLARE_SHARPNESS,
  RUNE_MATERIAL,
  RUNE_REST_STEPS,
  RUNE_STEP_SECONDS,
  SEAM_BAND_GAIN,
  SEAM_BAND_PERIOD_SECONDS,
  SEAM_BAND_WIDTH,
  SEAM_MATERIAL,
} from './constants'
import { bandSeams, glowEnamel, ownRuneMaterial, type SeamBand } from './cubeStackModel'

export interface CubeStack {
  ruin: THREE.Object3D
  band: SeamBand | null
  bottomY: number
  topY: number
  runes: GlowLevel[][]
  enamel: GlowLevel[]
  halos: HaloGem[]
}

const _bandSpot = new THREE.Vector3()

const isTier = (node: THREE.Object3D | null) => node?.userData.role === 'cube_tier'

function isWithinTier(mesh: THREE.Object3D) {
  for (let node = mesh.parent; node; node = node.parent) if (isTier(node)) return true
  return false
}

export function findCubeStack(ruin: THREE.Object3D): CubeStack {
  const tiers = ruin.children.filter(isTier).sort((a, b) => a.position.y - b.position.y)
  const cubes = tiers.flatMap((tier) =>
    tier.children
      .filter((child) => child.userData.role === 'gem')
      .sort((a, b) => a.position.x - b.position.x)
  )
  const runes = cubes
    .map((cube) => meshesOf(cube).filter((mesh) => materialNameOf(mesh).startsWith(RUNE_MATERIAL)))
    .filter((meshes) => meshes.length > 0)
    .map((meshes) => {
      meshes.forEach(ownRuneMaterial)
      return glowLevelsOf(meshes)
    })
  const enamel = cubes.flatMap((cube) =>
    meshesOf(cube).filter((mesh) => materialNameOf(mesh).includes(ENAMEL_MATERIAL_MARK))
  )
  enamel.forEach((mesh) => glowEnamel(mesh.material as THREE.MeshStandardMaterial))
  const seam = meshesOf(ruin).find((mesh) => materialNameOf(mesh).startsWith(SEAM_MATERIAL))
  const bounds = ruinBounds(ruin, isWithinTier)
  return {
    ruin,
    band: seam ? bandSeams(seam.material as THREE.MeshStandardMaterial) : null,
    bottomY: bounds.min.y,
    topY: bounds.max.y,
    runes,
    enamel: glowLevelsOf(enamel),
    halos: tiers.map((tier) => haloAround(ruin, tier, CUBE_HALO_COLOR)),
  }
}

export function sweepSeams({ ruin, band, bottomY, topY }: CubeStack, time: number, wake: number) {
  if (!band) return
  const progress = (time / SEAM_BAND_PERIOD_SECONDS) % 1
  const localY = mix(bottomY - SEAM_BAND_WIDTH, topY + SEAM_BAND_WIDTH, progress)
  band.uBandY.value = _bandSpot.set(0, localY, 0).applyMatrix4(ruin.matrixWorld).y
  band.uBandWidth.value = SEAM_BAND_WIDTH * ruin.scale.x
  band.uBandGain.value = SEAM_BAND_GAIN * wakeStrength(wake)
}

export function lightRunes({ runes }: CubeStack, time: number, wake: number) {
  const step = (time / RUNE_STEP_SECONDS) % (runes.length + RUNE_REST_STEPS)
  runes.forEach((levels, index) => {
    const since = step - index
    const flare = since >= 0 ? Math.exp(-since * RUNE_FLARE_SHARPNESS) : 0
    shineGlow(levels, wakeGlow(wake) * (1 + RUNE_FLARE * flare))
  })
}

export const glowCubes = ({ enamel }: CubeStack, time: number, wake: number) =>
  shineGlow(
    enamel,
    wakeGlow(wake) * (1 + CUBE_GLOW_BREATH * Math.sin(time * CUBE_GLOW_BREATH_RATE))
  )
