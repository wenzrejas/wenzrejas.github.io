import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DRACO_DECODER_PATH } from '@/app/experience/constants'
import { replaceMaterials } from '@/utils/meshes'
import { applyCloudShadow } from '@/world/environment/weather/cloudShadow'
import type { GlowTarget } from './nightGlow'

export interface TintTarget {
  material: THREE.MeshStandardMaterial
  base: THREE.Color
}

export interface IslandModel {
  model: THREE.Object3D
  footprint: number
  center: THREE.Vector3
  tints: TintTarget[]
  glows: GlowTarget[]
  loadTexture: (index: number) => Promise<THREE.Texture>
}

interface IslandSource {
  scene: THREE.Object3D
  parser: { getDependency: (type: 'texture', index: number) => Promise<THREE.Texture> }
}

function prepareIslandModel({ scene, parser }: IslandSource, isCloudShaded: boolean): IslandModel {
  const model = scene.clone(true)
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())

  const tints: TintTarget[] = []
  const glows: GlowTarget[] = []

  replaceMaterials(model, (source) => {
    const material = source.clone() as THREE.MeshPhysicalMaterial
    if ('roughness' in material) material.roughness = 1
    if ('specularIntensity' in material) material.specularIntensity = 0
    if ('color' in material) tints.push({ material: material, base: material.color.clone() })
    if ('emissive' in material && material.emissive.getHex() !== 0) {
      glows.push({ material: material, base: material.emissiveIntensity })
    }
    if (isCloudShaded) applyCloudShadow(material)
    return material
  })

  return {
    model,
    footprint: Math.max(size.x, size.z),
    center: box.getCenter(new THREE.Vector3()),
    tints,
    glows,
    loadTexture: (index) => parser.getDependency('texture', index),
  }
}

export function applyBrightness(tints: TintTarget[], brightness: number) {
  for (const { material, base } of tints) material.color.copy(base).multiplyScalar(brightness)
}

export function useIslandModel(url: string, brightness: number, isCloudShaded = true): IslandModel {
  const gltf = useGLTF(url, DRACO_DECODER_PATH)
  const island = useMemo(() => prepareIslandModel(gltf, isCloudShaded), [gltf, isCloudShaded])

  useLayoutEffect(() => applyBrightness(island.tints, brightness), [island, brightness])

  return island
}
