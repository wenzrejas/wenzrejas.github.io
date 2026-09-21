import * as THREE from 'three'
import { PHASES } from '../../DayNightCycle/dayNightKeyframes'

export function nightPresence(time: number): number {
  const { smoothstep } = THREE.MathUtils
  if (time >= PHASES.dusk && time < PHASES.midnight) {
    return smoothstep(time, PHASES.dusk, PHASES.midnight)
  }
  if (time >= PHASES.midnight) return 1
  if (time < PHASES['first light']) {
    return 1 - smoothstep(time, PHASES['pre-dawn'], PHASES['first light'])
  }
  return 0
}
