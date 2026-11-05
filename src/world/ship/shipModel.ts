import * as THREE from 'three'
import { flatFootprint, replaceMaterials } from '@/utils/meshes'
import { MODEL_BOW_OFFSET } from './constants'
import { applyCloudShadow } from '../environment/weather/cloudShadow'
import type { GlowTarget } from '../islands/shared/nightGlow'
import type { TintTarget } from '../islands/shared/islandModel'
import { dressLivery } from './liveryModel'
import { buildShipFadePass, dressShipFade } from './shipFade'
import { writeShipMask } from './shipMask'
import { buildShipRig } from './shipRigModel'

export function buildShipModel(scene: THREE.Object3D) {
  const clone = scene.clone(true)
  const footprint = flatFootprint(clone)
  clone.rotation.y = MODEL_BOW_OFFSET

  const glows: GlowTarget[] = []
  const tints: TintTarget[] = []

  replaceMaterials(clone, (source) => {
    const material = source.clone() as THREE.MeshStandardMaterial
    applyCloudShadow(material)
    dressLivery(material)
    dressShipFade(material)
    writeShipMask(material)
    if (material.map) {
      material.map.magFilter = THREE.NearestFilter
      material.map.minFilter = THREE.NearestMipmapNearestFilter
      material.map.needsUpdate = true
    }
    if (material.emissive.getHex() !== 0) {
      glows.push({ material, base: material.emissiveIntensity })
    }
    tints.push({ material, base: material.color.clone() })
    return material
  })

  return {
    clonedScene: clone,
    footprint,
    rig: buildShipRig(clone),
    fadePass: buildShipFadePass(clone),
    glows,
    tints,
  }
}
