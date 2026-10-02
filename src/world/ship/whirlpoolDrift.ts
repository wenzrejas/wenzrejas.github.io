import * as THREE from 'three'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import {
  WHIRLPOOL_EYE_CALM_SHARE,
  WHIRLPOOL_FULL_GRIP_SHARE,
  WHIRLPOOL_LEAN,
  WHIRLPOOL_PULL_REACH_SHARE,
  WHIRLPOOL_PULL_SPEED,
  WHIRLPOOL_SWIRL_SPEED,
} from './constants'

const { smoothstep } = THREE.MathUtils

const eyeCalm = (share: number) => smoothstep(share, 0, WHIRLPOOL_EYE_CALM_SHARE)

export function whirlpoolCurrent(x: number, z: number, out: THREE.Vector2): THREE.Vector2 {
  out.set(0, 0)
  const whirlpool = useWhirlpoolStore.getState()
  if (!whirlpool.active) return out

  const dx = x - whirlpool.x
  const dz = z - whirlpool.z
  const distance = Math.hypot(dx, dz)
  const share = distance / whirlpool.radius
  const grip =
    (1 - smoothstep(share, WHIRLPOOL_FULL_GRIP_SHARE, WHIRLPOOL_PULL_REACH_SHARE)) * eyeCalm(share)
  if (grip === 0) return out

  const swirl = (WHIRLPOOL_SWIRL_SPEED * grip) / distance
  const pull = (WHIRLPOOL_PULL_SPEED * grip) / distance
  return out.set(swirl * dz - pull * dx, -swirl * dx - pull * dz)
}

export function whirlpoolLean(
  x: number,
  z: number,
  heading: number,
  out: THREE.Vector2
): THREE.Vector2 {
  out.set(0, 0)
  const whirlpool = useWhirlpoolStore.getState()
  if (!whirlpool.active) return out

  const dx = x - whirlpool.x
  const dz = z - whirlpool.z
  const distance = Math.hypot(dx, dz)
  const share = distance / whirlpool.radius
  if (share >= 1 || distance === 0) return out

  const slope =
    (whirlpool.depth * whirlpool.curve * (1 - share) ** (whirlpool.curve - 1)) / whirlpool.radius
  const lean = Math.atan(slope) * WHIRLPOOL_LEAN * eyeCalm(share)
  const towardX = -dx / distance
  const towardZ = -dz / distance
  const ahead = -towardX * Math.sin(heading) - towardZ * Math.cos(heading)
  const aside = towardX * Math.cos(heading) - towardZ * Math.sin(heading)
  return out.set(-lean * ahead, -lean * aside)
}
