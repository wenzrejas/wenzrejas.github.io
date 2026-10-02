import * as THREE from 'three'
import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import { DIAL_ICON_REACH, DIAL_SKY, DIAL_STARS, MOON_MARK_TIME, SUN_MARK_TIME } from './constants'

export const wheelTurnDegrees = (timeOfDay: number) => timeOfDay * 360

function wheelPosition(timeOfDay: number, reach: number) {
  const angle = THREE.MathUtils.degToRad(-wheelTurnDegrees(timeOfDay))
  return {
    left: `${50 + 50 * reach * Math.cos(angle)}%`,
    top: `${50 + 50 * reach * Math.sin(angle)}%`,
  }
}

export const SUN_POSITION = wheelPosition(SUN_MARK_TIME, DIAL_ICON_REACH)
export const MOON_POSITION = wheelPosition(MOON_MARK_TIME, DIAL_ICON_REACH)
export const STAR_POSITIONS = DIAL_STARS.map(([time, reach]) => wheelPosition(time, reach))

const skyStops = DIAL_SKY.map(([phase, color]) => ({
  percent: (1 - PHASES[phase]) * 100,
  color,
})).sort((a, b) => a.percent - b.percent)
const wrapStop = { percent: 0, color: skyStops[skyStops.length - 1].color }

export const DIAL_SKY_GRADIENT = `conic-gradient(from 90deg, ${[wrapStop, ...skyStops]
  .map(({ percent, color }) => `${color} ${percent.toFixed(1)}%`)
  .join(', ')})`
