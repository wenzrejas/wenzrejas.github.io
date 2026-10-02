import * as THREE from 'three'
import type { WindLineControls } from '@/app/debug/types'
import { useWindStore } from '@/store/windStore'
import { rand } from '@/utils/math'
import {
  LINE_DURATION,
  WIND_AXIS,
  WIND_CHANGE_INTERVAL,
  WIND_SPAWN_AREA,
  WIND_SPAWN_JITTER_MAX,
  WIND_SPAWN_JITTER_MIN,
  WIND_SPREAD,
  WIND_STREAK_END,
  WIND_STREAK_POOL,
  WIND_TURN_RATE,
} from './constants'

export interface WindStreak {
  isActive: boolean
  progress: number
  duration: number
  x: number
  y: number
  z: number
  velocityX: number
  velocityZ: number
  angle: number
  length: number
  amplitude: number
}

export interface WindState {
  angle: number
  target: number
  untilChange: number
  nextSpawnAt: number
  streaks: WindStreak[]
}

function pickWindAngle(): number {
  const base = WIND_AXIS + (Math.random() < 0.5 ? 0 : Math.PI)
  return base + (Math.random() - 0.5) * 2 * WIND_SPREAD
}

const createStreak = (): WindStreak => ({
  isActive: false,
  progress: 0,
  duration: LINE_DURATION,
  x: 0,
  y: 0,
  z: 0,
  velocityX: 0,
  velocityZ: 0,
  angle: 0,
  length: 1,
  amplitude: 1,
})

export const createWindState = (): WindState => ({
  angle: pickWindAngle(),
  target: pickWindAngle(),
  untilChange: WIND_CHANGE_INTERVAL,
  nextSpawnAt: 0,
  streaks: Array.from({ length: WIND_STREAK_POOL }, createStreak),
})

export function turnWind(wind: WindState, dt: number): number {
  let remaining = wind.target - wind.angle
  remaining = ((remaining + Math.PI) % (2 * Math.PI)) - Math.PI
  wind.angle += THREE.MathUtils.clamp(remaining, -WIND_TURN_RATE * dt, WIND_TURN_RATE * dt)

  wind.untilChange -= dt
  if (wind.untilChange <= 0) {
    wind.target = pickWindAngle()
    wind.untilChange = WIND_CHANGE_INTERVAL
    for (const streak of wind.streaks) streak.isActive = false
  }

  const store = useWindStore.getState()
  store.angle = wind.angle
  store.dir.set(Math.cos(wind.angle), -Math.sin(wind.angle))
  return Math.abs(remaining)
}

export function advanceStreak(streak: WindStreak, dt: number) {
  streak.progress += dt / streak.duration
  streak.x += streak.velocityX * dt
  streak.z += streak.velocityZ * dt
  if (streak.progress >= WIND_STREAK_END) streak.isActive = false
}

export function spawnStreak(
  wind: WindState,
  time: number,
  centerX: number,
  centerZ: number,
  tuning: WindLineControls,
  windMult: number
) {
  if (time < wind.nextSpawnAt) return

  const streak = wind.streaks.find((candidate) => !candidate.isActive)
  if (streak) {
    streak.isActive = true
    streak.progress = 0
    streak.duration = tuning.lineDuration
    streak.velocityX = Math.cos(wind.angle) * tuning.windSpeed * windMult
    streak.velocityZ = -Math.sin(wind.angle) * tuning.windSpeed * windMult
    streak.x = centerX + (Math.random() - 0.5) * WIND_SPAWN_AREA
    streak.y = tuning.lineY
    streak.z = centerZ + (Math.random() - 0.5) * WIND_SPAWN_AREA
    streak.angle = wind.angle
    streak.length = tuning.lineLength
    streak.amplitude = tuning.waveAmplitude
  }
  wind.nextSpawnAt =
    time + tuning.spawnInterval * rand(WIND_SPAWN_JITTER_MIN, WIND_SPAWN_JITTER_MAX)
}
