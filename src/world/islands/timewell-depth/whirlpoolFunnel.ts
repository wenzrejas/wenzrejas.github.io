import * as THREE from 'three'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { WHIRLPOOL_FUNNEL_CURVE, WHIRLPOOL_FUNNEL_DEPTH } from './constants'

export const whirlpoolFunnelUniforms = {
  uWhirlpool: { value: new THREE.Vector4() },
  uWhirlpoolShape: { value: new THREE.Vector2(1, 0) },
}

export const funnelDip = (share: number) =>
  WHIRLPOOL_FUNNEL_DEPTH * Math.max(0, 1 - share) ** WHIRLPOOL_FUNNEL_CURVE

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
  return (
    whirlpool.radius * funnelDip(Math.hypot(x - whirlpool.x, z - whirlpool.z) / whirlpool.radius)
  )
}
