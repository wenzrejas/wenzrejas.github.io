import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useWeatherStore } from '@/store/weatherStore'
import { rand } from '@/utils/math'
import {
  SPARKLE_MOON_RANGE,
  SPARKLE_NIGHT_START,
  SPARKLE_Y,
  SUN_SPARKLE_CLEAR_SHADOW,
  SUN_SPARKLE_GONE_SHADOW,
  SUN_SPARKLE_NIGHT_END,
  SUN_SPARKLE_STRENGTH,
} from './constants'

export interface SparkleField {
  count: number
  spread: number
  lifeMin: number
  lifeMax: number
  sizeMin: number
  sizeMax: number
  color: string
  armSharpness: number
  armFalloff: number
  glowRadius: number
}

const { clamp, smoothstep } = THREE.MathUtils

export const sparkleLife = (field: SparkleField) => rand(field.lifeMin, field.lifeMax)
export const sparkleSize = (field: SparkleField) => rand(field.sizeMin, field.sizeMax)
export const scatterAround = (field: SparkleField, center: number) =>
  center + (Math.random() - 0.5) * field.spread * 2

export function moonSparkleIntensity(): number {
  const { moonMult } = useWeatherStore.getState()
  const { nightFactor } = useCycleStore.getState()
  const moonFactor = Math.max(0, (moonMult - 1) / SPARKLE_MOON_RANGE)
  const nightGate = clamp((nightFactor - SPARKLE_NIGHT_START) / (1 - SPARKLE_NIGHT_START), 0, 1)
  return moonFactor * nightGate
}

export function sunSparkleIntensity(): number {
  const { cloudShadow } = useWeatherStore.getState()
  const { nightFactor } = useCycleStore.getState()
  const sunlight = 1 - smoothstep(cloudShadow, SUN_SPARKLE_CLEAR_SHADOW, SUN_SPARKLE_GONE_SHADOW)
  const dayGate = 1 - smoothstep(nightFactor, 0, SUN_SPARKLE_NIGHT_END)
  return SUN_SPARKLE_STRENGTH * sunlight * dayGate
}

export function respawnSparkles(
  geometry: THREE.BufferGeometry,
  field: SparkleField,
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

  for (let i = 0; i < field.count; i++) {
    lifetimes[i] += dt
    if (lifetimes[i] < maxLifetimes[i]) continue
    positions[i * 3] = scatterAround(field, centerX)
    positions[i * 3 + 1] = SPARKLE_Y
    positions[i * 3 + 2] = scatterAround(field, centerZ)
    lifetimes[i] = 0
    maxLifetimes[i] = sparkleLife(field)
    sizes[i] = sparkleSize(field)
    hasRespawned = true
  }

  lifetime.needsUpdate = true
  if (hasRespawned) {
    position.needsUpdate = true
    maxLifetime.needsUpdate = true
    size.needsUpdate = true
  }
}
