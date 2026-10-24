import type * as THREE from 'three'
import { TORCH_ANCHOR_ROLE, TORCH_FLICKER_SPREAD_SECONDS } from './constants'

export interface TorchSite {
  ruin: THREE.Object3D
  base: THREE.Vector3
  height: number
  phase: number
}

export const findTorchSites = (ruins: THREE.Object3D[]): TorchSite[] =>
  ruins.flatMap((ruin) =>
    ruin.children
      .filter((child) => child.userData.role === TORCH_ANCHOR_ROLE)
      .map((anchor) => ({
        ruin,
        base: anchor.position.clone(),
        height: anchor.userData.flameHeight as number,
        phase: Math.random() * TORCH_FLICKER_SPREAD_SECONDS,
      }))
  )
