import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { mix } from '@/utils/math'
import { dayNightGlow, nightGlow } from '../shared/nightGlow'
import type { HoverTimeline } from '../shared/hoverTimeline'
import { glowLevel, ripplePhase, spiralLevel } from './awakening'
import {
  AWAKEN_DAY_SHARE,
  WHIRLPOOL_FLOW_DENSITY,
  WHIRLPOOL_FLOW_SPEED,
  WHIRLPOOL_FUNNEL_CURVE,
  WHIRLPOOL_FUNNEL_DEPTH,
  WHIRLPOOL_MAGIC_DAY_SHARE,
  WHIRLPOOL_RADIUS,
  WHIRLPOOL_TWIST,
} from './constants'
import { syncWhirlpoolFunnel } from './whirlpoolFunnel'

const _eye = new THREE.Vector3()

export function publishWhirlpool(mesh: THREE.Mesh, islandScale: number) {
  const presence = useWhirlpoolStore.getState()
  _eye.setFromMatrixPosition(mesh.matrixWorld)
  presence.active = true
  presence.x = _eye.x
  presence.z = _eye.z
  presence.radius = WHIRLPOOL_RADIUS * islandScale
  presence.depth = WHIRLPOOL_FUNNEL_DEPTH * presence.radius
  presence.curve = WHIRLPOOL_FUNNEL_CURVE
  presence.twist = WHIRLPOOL_TWIST
  presence.drainRate = WHIRLPOOL_FLOW_SPEED / WHIRLPOOL_FLOW_DENSITY
  syncWhirlpoolFunnel()
}

export function retireWhirlpool() {
  useWhirlpoolStore.getState().active = false
  syncWhirlpoolFunnel()
}

export function paintWhirlpool(
  uniforms: Record<string, THREE.IUniform>,
  time: number,
  background: unknown,
  awakening: HoverTimeline
) {
  const night = nightGlow()
  uniforms.uTime.value = time
  uniforms.uNight.value = night
  uniforms.uMagic.value = mix(WHIRLPOOL_MAGIC_DAY_SHARE, 1, night)
  ;(uniforms.uFoamColor.value as THREE.Color).copy(useCycleStore.getState().foamColor)
  if (background instanceof THREE.Color) {
    ;(uniforms.uBackground.value as THREE.Color).copyLinearToSRGB(background)
  }
  const awakenLight = dayNightGlow(AWAKEN_DAY_SHARE)
  uniforms.uWaterGlow.value = glowLevel(awakening) * awakenLight
  uniforms.uSpiralGlow.value = spiralLevel(awakening) * awakenLight
  uniforms.uRipple.value = ripplePhase(awakening)
  uniforms.uRippleGlow.value = awakening.presence * awakenLight
}
