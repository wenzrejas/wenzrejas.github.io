import * as THREE from 'three'
import { mix, rand } from '@/utils/math'
import {
  CRYSTAL_SHAPE_JITTER,
  FRAGMENT_BOB_HEIGHT,
  FRAGMENT_BOB_RATE,
  FRAGMENT_COUNT,
  FRAGMENT_HEIGHT_MAX,
  FRAGMENT_HEIGHT_MIN,
  FRAGMENT_ORBIT_MAX,
  FRAGMENT_ORBIT_MIN,
  FRAGMENT_ORBIT_RATE,
  FRAGMENT_RISE_TURN,
  FRAGMENT_SIZE_MAX,
  FRAGMENT_SIZE_MIN,
  FRAGMENT_SLOT_JITTER,
  FRAGMENT_TUMBLE_RATE,
  FRAGMENT_TUMBLE_TILT,
} from './constants'
import { WHIRLPOOL_FUNNEL_DEPTH } from '../constants'

export interface MemoryFragment {
  slot: number
  orbitRadius: number
  height: number
  shape: THREE.Vector3
  bobPhase: number
  tumbleAxis: THREE.Vector3
  tumblePhase: number
  position: THREE.Vector3
  rotation: THREE.Quaternion
  scale: THREE.Vector3
}

const _placement = new THREE.Matrix4()

const jittered = () => rand(1 - CRYSTAL_SHAPE_JITTER, 1 + CRYSTAL_SHAPE_JITTER)

export const arrangeFragments = (): MemoryFragment[] =>
  Array.from({ length: FRAGMENT_COUNT }, (_, i) => ({
    slot: (i / FRAGMENT_COUNT) * Math.PI * 2 + rand(-FRAGMENT_SLOT_JITTER, FRAGMENT_SLOT_JITTER),
    orbitRadius: rand(FRAGMENT_ORBIT_MIN, FRAGMENT_ORBIT_MAX),
    height: rand(FRAGMENT_HEIGHT_MIN, FRAGMENT_HEIGHT_MAX),
    shape: new THREE.Vector3(jittered(), jittered(), jittered()).multiplyScalar(
      rand(FRAGMENT_SIZE_MIN, FRAGMENT_SIZE_MAX)
    ),
    bobPhase: rand(0, Math.PI * 2),
    tumbleAxis: new THREE.Vector3(
      rand(-FRAGMENT_TUMBLE_TILT, FRAGMENT_TUMBLE_TILT),
      1,
      rand(-FRAGMENT_TUMBLE_TILT, FRAGMENT_TUMBLE_TILT)
    ).normalize(),
    tumblePhase: rand(0, Math.PI * 2),
    position: new THREE.Vector3(),
    rotation: new THREE.Quaternion(),
    scale: new THREE.Vector3(),
  }))

export function floatFragment(fragment: MemoryFragment, rise: number, time: number) {
  const angle = fragment.slot + time * FRAGMENT_ORBIT_RATE - (1 - rise) * FRAGMENT_RISE_TURN
  const reach = fragment.orbitRadius * rise
  const bob = Math.sin(time * FRAGMENT_BOB_RATE + fragment.bobPhase) * FRAGMENT_BOB_HEIGHT
  fragment.position.set(
    Math.cos(angle) * reach,
    mix(-WHIRLPOOL_FUNNEL_DEPTH, fragment.height + bob, rise),
    -Math.sin(angle) * reach
  )
  fragment.rotation.setFromAxisAngle(
    fragment.tumbleAxis,
    fragment.tumblePhase + time * FRAGMENT_TUMBLE_RATE
  )
  fragment.scale.copy(fragment.shape).multiplyScalar(Math.sqrt(rise))
}

export const fragmentPlacement = ({ position, rotation, scale }: MemoryFragment) =>
  _placement.compose(position, rotation, scale)

export function writeHalos(fragments: MemoryFragment[], halos: THREE.BufferGeometry) {
  const positions = halos.getAttribute('position')
  fragments.forEach(({ position }, i) => positions.setXYZ(i, position.x, position.y, position.z))
  positions.needsUpdate = true
}
