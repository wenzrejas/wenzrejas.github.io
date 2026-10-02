import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useWeatherStore } from '@/store/weatherStore'
import { rand } from '@/utils/math'
import {
  SPARKLE_COUNT,
  SPARKLE_LIFE_MAX,
  SPARKLE_LIFE_MIN,
  SPARKLE_MOON_RANGE,
  SPARKLE_NIGHT_START,
  SPARKLE_SIZE_MAX,
  SPARKLE_SIZE_MIN,
  SPARKLE_SPREAD,
  SPARKLE_Y,
} from './constants'

export const sparkleLife = () => rand(SPARKLE_LIFE_MIN, SPARKLE_LIFE_MAX)
export const sparkleSize = () => rand(SPARKLE_SIZE_MIN, SPARKLE_SIZE_MAX)
export const scatterAround = (center: number) => center + (Math.random() - 0.5) * SPARKLE_SPREAD * 2

export function sparkleIntensity(): number {
  const { moonMult } = useWeatherStore.getState()
  const { nightFactor } = useCycleStore.getState()
  const moonFactor = Math.max(0, (moonMult - 1) / SPARKLE_MOON_RANGE)
  const nightGate = THREE.MathUtils.clamp(
    (nightFactor - SPARKLE_NIGHT_START) / (1 - SPARKLE_NIGHT_START),
    0,
    1
  )
  return moonFactor * nightGate
}

export function respawnSparkles(
  geometry: THREE.BufferGeometry,
  centerX: number,
  centerZ: number,
  dt: number
) {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  const lifetime = geometry.getAttribute('aLifetime') as THREE.BufferAttribute
  const maxLifetime = geometry.getAttribute('aMaxLifetime') as THREE.BufferAttribute
  const size = geometry.getAttribute('aSize') as THREE.BufferAttribute
  const positions = position.array as Float32Array
  const lifetimes = lifetime.array as Float32Array
  const maxLifetimes = maxLifetime.array as Float32Array
  const sizes = size.array as Float32Array
  let hasRespawned = false

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    lifetimes[i] += dt
    if (lifetimes[i] < maxLifetimes[i]) continue
    positions[i * 3] = scatterAround(centerX)
    positions[i * 3 + 1] = SPARKLE_Y
    positions[i * 3 + 2] = scatterAround(centerZ)
    lifetimes[i] = 0
    maxLifetimes[i] = sparkleLife()
    sizes[i] = sparkleSize()
    hasRespawned = true
  }

  lifetime.needsUpdate = true
  if (hasRespawned) {
    position.needsUpdate = true
    maxLifetime.needsUpdate = true
    size.needsUpdate = true
  }
}
