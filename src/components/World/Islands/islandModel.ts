import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { applyCloudShadow } from '../../../utils/cloudShadow'
import { OUTLINE_MAT } from './outlineMaterial'
import type { GlowTarget } from './nightGlow'

const OUTLINE_GROWTH = 1.03

interface TintTarget {
  mat: THREE.MeshStandardMaterial
  base: THREE.Color
}

export interface IslandModel {
  model: THREE.Object3D
  outline: THREE.Object3D | null
  footprint: number
  center: THREE.Vector3
  tints: TintTarget[]
  glows: GlowTarget[]
}

function buildOutline(model: THREE.Object3D, bodyNode: string): THREE.Object3D | null {
  const body = model.getObjectByName(bodyNode)
  if (!body) return null

  const outline = body.clone(true)
  outline.scale.multiplyScalar(OUTLINE_GROWTH)
  outline.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) mesh.material = OUTLINE_MAT
  })
  return outline
}

function prepareIslandModel(scene: THREE.Object3D, bodyNode: string): IslandModel {
  const model = scene.clone(true)
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())

  const tints: TintTarget[] = []
  const glows: GlowTarget[] = []
  const cache = new Map<THREE.Material, THREE.Material>()

  const flatten = (source: THREE.Material): THREE.Material => {
    const cached = cache.get(source)
    if (cached) return cached

    const mat = source.clone() as THREE.MeshPhysicalMaterial
    if ('roughness' in mat) mat.roughness = 1
    if ('specularIntensity' in mat) mat.specularIntensity = 0
    if ('color' in mat) tints.push({ mat, base: mat.color.clone() })
    if ('emissive' in mat && mat.emissive.getHex() !== 0) {
      glows.push({ mat, base: mat.emissiveIntensity })
    }
    applyCloudShadow(mat)
    cache.set(source, mat)
    return mat
  }

  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(flatten)
      : flatten(mesh.material)
  })

  return {
    model,
    outline: buildOutline(model, bodyNode),
    footprint: Math.max(size.x, size.z),
    center: box.getCenter(new THREE.Vector3()),
    tints,
    glows,
  }
}

export function useIslandModel(url: string, bodyNode: string, brightness: number): IslandModel {
  const { scene } = useGLTF(url)
  const island = useMemo(() => prepareIslandModel(scene, bodyNode), [scene, bodyNode])

  useLayoutEffect(() => {
    for (const { mat, base } of island.tints) mat.color.copy(base).multiplyScalar(brightness)
  }, [island, brightness])

  return island
}
