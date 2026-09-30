import * as THREE from 'three'
import { useWhirlpoolStore } from '../store/whirlpoolStore'

export const whirlpoolFunnelUniforms = {
  uWhirlpool: { value: new THREE.Vector4() },
  uWhirlpoolShape: { value: new THREE.Vector2(1, 0) },
}

export function syncWhirlpoolFunnel(): void {
  const whirlpool = useWhirlpoolStore.getState()
  whirlpoolFunnelUniforms.uWhirlpool.value.set(
    whirlpool.x,
    whirlpool.z,
    whirlpool.active ? whirlpool.radius : 0,
    whirlpool.active ? whirlpool.depth : 0
  )
  whirlpoolFunnelUniforms.uWhirlpoolShape.value.set(whirlpool.curve, whirlpool.twist)
}

export function whirlpoolDip(x: number, z: number): number {
  const whirlpool = useWhirlpoolStore.getState()
  if (!whirlpool.active) return 0
  const share = Math.hypot(x - whirlpool.x, z - whirlpool.z) / whirlpool.radius
  return share >= 1 ? 0 : whirlpool.depth * (1 - share) ** whirlpool.curve
}
