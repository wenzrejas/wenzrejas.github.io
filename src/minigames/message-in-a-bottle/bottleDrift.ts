import type * as THREE from 'three'
import { zoomedOutBoost } from '@/app/experience/worldZoom'
import {
  BOTTLE_BOB,
  BOTTLE_BOB_RATE,
  BOTTLE_FLOAT_HEIGHT,
  BOTTLE_PHASE_FROM_X,
  BOTTLE_PHASE_FROM_Z,
  BOTTLE_ROCK,
  BOTTLE_ROCK_RATE,
  BOTTLE_SCALE,
  BOTTLE_TILT,
  BOTTLE_ZOOMED_OUT_BOOST_MAX,
} from './constants'

export const bottleScaleFor = (width: number, height: number) =>
  BOTTLE_SCALE * zoomedOutBoost(width, height, BOTTLE_ZOOMED_OUT_BOOST_MAX)

export function poseBottle(
  pose: THREE.Object3D,
  { x, z }: { x: number; z: number },
  scale: number,
  time: number,
  swell: number
) {
  const phase = x * BOTTLE_PHASE_FROM_X + z * BOTTLE_PHASE_FROM_Z
  const rock = Math.sin(time * BOTTLE_ROCK_RATE + phase) * BOTTLE_ROCK * swell
  const bob = Math.sin(time * BOTTLE_BOB_RATE + phase) * BOTTLE_BOB * swell
  pose.position.set(x, (BOTTLE_FLOAT_HEIGHT + bob) * scale, z)
  pose.rotation.set(BOTTLE_TILT + rock, phase, rock, 'YXZ')
  pose.scale.setScalar(scale)
  pose.updateMatrix()
}
