import * as THREE from 'three'
import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import { SMOKE_FADE_CYCLES } from './constants'

export function daytimePresence(time: number): number {
  const { smoothstep } = THREE.MathUtils
  const started = smoothstep(time, PHASES.morning - SMOKE_FADE_CYCLES, PHASES.morning)
  const ended = smoothstep(time, PHASES.dusk, PHASES.dusk + SMOKE_FADE_CYCLES)
  return started * (1 - ended)
}
