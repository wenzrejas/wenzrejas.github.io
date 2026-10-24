import * as THREE from 'three'
import { stoneMatrix, type SceneryKit } from './sceneryKitModel'

const _position = new THREE.Vector3()
const _turn = new THREE.Quaternion()
const _spin = new THREE.Quaternion()
const _matrix = new THREE.Matrix4()

export function driftScenery({ drifting, driftingMeshes }: SceneryKit, time: number) {
  for (const { position, turn, size, drift, mesh, index } of drifting) {
    const swing = time * drift.bobRate + drift.phase
    _position.copy(position).setY(position.y + Math.sin(swing) * drift.bob)
    _turn.copy(turn).multiply(_spin.setFromAxisAngle(drift.spinAxis, time * drift.spinRate))
    mesh.setMatrixAt(index, stoneMatrix(_position, _turn, size, _matrix))
  }
  for (const mesh of driftingMeshes) mesh.instanceMatrix.needsUpdate = true
}
