import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MODEL_BOW_OFFSET } from './constants'
import { applyCloudShadow } from '../environment/weather/cloudShadow'
import type { GlowTarget } from '../islands/shared/nightGlow'
import { applyBrightness, type TintTarget } from '../islands/shared/islandModel'
import { buildShipRig } from './shipRigModel'

const MODEL_URL = '/models/ship/voyager-red-draco.glb'

export function useShipModel(brightness: number) {
  const { scene } = useGLTF(MODEL_URL)

  const ship = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    clone.rotation.y = MODEL_BOW_OFFSET

    const glows: GlowTarget[] = []
    const tints: TintTarget[] = []
    const cache = new Map<THREE.Material, THREE.Material>()
    const cloneMat = (m: THREE.Material): THREE.Material => {
      const cached = cache.get(m)
      if (cached) return cached
      const mat = m.clone() as THREE.MeshStandardMaterial
      applyCloudShadow(mat)
      if (mat.map) {
        mat.map.magFilter = THREE.NearestFilter
        mat.map.minFilter = THREE.NearestMipmapNearestFilter
        mat.map.needsUpdate = true
      }
      if (mat.emissive.getHex() !== 0) glows.push({ mat, base: mat.emissiveIntensity })
      tints.push({ mat, base: mat.color.clone() })
      cache.set(m, mat)
      return mat
    }

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(cloneMat)
        : cloneMat(mesh.material)
    })

    return {
      clonedScene: clone,
      footprint: Math.max(size.x, size.z),
      rig: buildShipRig(clone),
      glows,
      tints,
    }
  }, [scene])

  useLayoutEffect(() => applyBrightness(ship.tints, brightness), [ship, brightness])

  return { scene, ...ship }
}

useGLTF.preload(MODEL_URL)
