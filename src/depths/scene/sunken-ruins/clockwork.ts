import * as THREE from 'three'
import { GEM_BOB_RATE } from './constants'
import type { RuinMover } from './sunkenRuinsModel'

const _turn = new THREE.Quaternion()

export function turnClockwork(movers: RuinMover[], time: number) {
  for (const { node, axis, turnRate, baseQuaternion, baseY, bobHeight, phase } of movers) {
    node.quaternion.copy(baseQuaternion).multiply(_turn.setFromAxisAngle(axis, time * turnRate))
    if (bobHeight > 0) node.position.y = baseY + Math.sin(time * GEM_BOB_RATE + phase) * bobHeight
  }
}
