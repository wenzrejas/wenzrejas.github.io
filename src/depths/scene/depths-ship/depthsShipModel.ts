import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { meshesOf } from '@/utils/meshes'
import { applyBrightness } from '@/world/islands/shared/islandModel'
import { MODEL_BOW_OFFSET, MODEL_BRIGHTNESS } from '@/world/ship/constants'
import { dressLivery } from '@/world/ship/liveryModel'
import { DEPTHS_SHIP_LENGTH } from './constants'

export interface DepthsShipModel {
  root: THREE.Group
  materials: THREE.MeshStandardMaterial[]
  keelDepth: number
}

export function buildDepthsShip(source: THREE.Object3D): DepthsShipModel {
  const model = source.clone(true)
  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3())
  model.rotation.y = MODEL_BOW_OFFSET
  model.scale.setScalar(DEPTHS_SHIP_LENGTH / Math.max(size.x, size.z))
  model.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(model)
  model.position.sub(bounds.getCenter(new THREE.Vector3()))

  const copies = new Map<THREE.Material, THREE.MeshStandardMaterial>()
  const copyOf = (material: THREE.Material) => {
    const known = copies.get(material)
    if (known) return known
    const copy = material.clone() as THREE.MeshStandardMaterial
    copy.fog = false
    copy.transparent = true
    dressLivery(copy)
    copies.set(material, copy)
    return copy
  }
  for (const mesh of meshesOf(model)) {
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(copyOf) : copyOf(mesh.material)
    mesh.renderOrder = RENDER_LAYER.depthsShip
  }

  const materials = [...copies.values()]
  applyBrightness(
    materials.map((mat) => ({ mat, base: mat.color.clone() })),
    MODEL_BRIGHTNESS
  )
  const root = new THREE.Group()
  root.add(model)
  return { root, materials, keelDepth: (bounds.max.y - bounds.min.y) / 2 }
}

export function disposeDepthsShip({ materials }: DepthsShipModel) {
  for (const material of materials) material.dispose()
}
