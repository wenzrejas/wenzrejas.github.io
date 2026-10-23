import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { uniformsOf } from '@/utils/meshes'
import { buildFlameGeometry, createFlameMaterial } from '@/world/effects/flame/flameModel'
import {
  TORCH_FIRE_INTENSITY,
  TORCH_FLAME_GLOW,
  TORCH_FLAME_SCALE,
  TORCH_FLICKER_TIME_SCALE,
} from './constants'
import type { TorchSite } from './torchSites'

export function buildTorchFlames(sites: TorchSite[]): THREE.Mesh[] {
  const geometry = buildFlameGeometry(1)
  return sites.map(({ base }) => {
    const flame = new THREE.Mesh(geometry, createFlameMaterial(TORCH_FLAME_GLOW))
    flame.position.copy(base)
    flame.frustumCulled = false
    flame.renderOrder = RENDER_LAYER.effects
    return flame
  })
}

export function lightTorches(sites: TorchSite[], flames: THREE.Mesh[]) {
  sites.forEach(({ ruin }, index) => ruin.add(flames[index]))
}

export function douseTorches(flames: THREE.Mesh[]) {
  for (const flame of flames) {
    const material = flame.material as THREE.Material
    flame.removeFromParent()
    material.dispose()
  }
  flames[0]?.geometry.dispose()
}

export function flickerTorches(sites: TorchSite[], flames: THREE.Mesh[], time: number) {
  sites.forEach(({ ruin, height, phase }, index) => {
    const uniforms = uniformsOf(flames[index])
    uniforms.uTime.value = (time + phase) * TORCH_FLICKER_TIME_SCALE
    uniforms.uSize.value = height * ruin.scale.x * TORCH_FLAME_SCALE
    uniforms.uIntensity.value = TORCH_FIRE_INTENSITY
  })
}
