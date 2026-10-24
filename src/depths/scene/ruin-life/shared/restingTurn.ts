import * as THREE from 'three'
import { onceFor } from '@/utils/cache'

const restingTurns = new WeakMap<THREE.Object3D, THREE.Quaternion>()
const _turn = new THREE.Quaternion()

const restingTurnOf = (node: THREE.Object3D) =>
  onceFor(restingTurns, node, () => node.quaternion.clone())

export function turnFromRest(node: THREE.Object3D, axis: THREE.Vector3, angle: number) {
  node.quaternion.copy(restingTurnOf(node)).multiply(_turn.setFromAxisAngle(axis, angle))
}
