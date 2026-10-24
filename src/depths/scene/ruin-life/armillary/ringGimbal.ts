import * as THREE from 'three'
import { turnFromRest } from '../shared/restingTurn'
import { RING_ROLE, RING_TURNS } from './constants'

interface GimbalRing {
  node: THREE.Object3D
  axis: THREE.Vector3
  rate: number
}

export const findGimbalRings = (ruin: THREE.Object3D): GimbalRing[] =>
  ruin.children
    .filter((child) => child.userData.role === RING_ROLE && RING_TURNS[child.name])
    .map((node) => {
      const { axis, rate } = RING_TURNS[node.name]
      return { node, axis: new THREE.Vector3(...axis).normalize(), rate }
    })

export function turnGimbal(rings: GimbalRing[], time: number) {
  for (const { node, axis, rate } of rings) turnFromRest(node, axis, time * rate)
}
