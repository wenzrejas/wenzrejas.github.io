import * as THREE from 'three'
import { displayColorOf } from '@/utils/color'
import type { HaloGem } from '@/world/islands/shared/gem-halo/gemHaloModel'
import { GEM_HALO_COLOR } from './constants'

export function haloGemOf(gem: THREE.Mesh): HaloGem {
  gem.geometry.computeBoundingBox()
  const size = gem.geometry.boundingBox!.getSize(new THREE.Vector3())
  return {
    center: new THREE.Vector3(),
    radius: Math.max(size.x, size.z) / 2,
    color: displayColorOf(GEM_HALO_COLOR),
  }
}
