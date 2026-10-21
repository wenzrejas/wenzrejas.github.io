import type * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { meshesNamed } from '@/utils/meshes'
import { cloneLit } from '@/world/islands/shared/materialPatch'
import { STATION_WINDOW_NODES } from './constants'

export interface StationWindows {
  glass: THREE.MeshStandardMaterial
  baseIntensity: number
}

const litStations = new WeakMap<THREE.Mesh, StationWindows>()

export function prepareStationWindows(model: THREE.Object3D): StationWindows | null {
  const meshes = meshesNamed(model, STATION_WINDOW_NODES)
  if (meshes.length === 0) return null

  return onceFor(litStations, meshes[0], () => {
    const glass = cloneLit(meshes[0].material as THREE.MeshStandardMaterial)
    for (const mesh of meshes) mesh.material = glass
    return { glass, baseIntensity: glass.emissiveIntensity }
  })
}

export function lightStationWindows(windows: StationWindows, level: number): void {
  windows.glass.emissiveIntensity = windows.baseIntensity * level
}
