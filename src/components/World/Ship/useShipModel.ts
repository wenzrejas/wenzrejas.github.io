import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MODEL_BOW_OFFSET } from './constants'
import { applyCloudShadow } from '../../../utils/cloudShadow'

const MODEL_URL = '/models/ship/ship-medium.glb'

export function useShipModel() {
  const { scene } = useGLTF(MODEL_URL)

  return useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    clone.rotation.y = MODEL_BOW_OFFSET

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

    return { clonedScene: clone, footprint: Math.max(size.x, size.z) }
  }, [scene])
}

useGLTF.preload(MODEL_URL)
