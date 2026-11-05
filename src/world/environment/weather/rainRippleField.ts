import type * as THREE from 'three'
import { GROUND_FORWARD, SCREEN_RIGHT } from '@/app/experience/cameraFraming'
import { useWeatherStore } from '@/store/weatherStore'
import { useWhirlpoolStore } from '@/store/whirlpoolStore'
import { algaeAt, queueGlowHit } from '@/world/wildlife/algae/algaeField'
import {
  RAIN_RIPPLE_LIFETIME,
  RAIN_RIPPLE_MAX,
  RAIN_RIPPLE_MIN_INTENSITY,
  RAIN_RIPPLE_SPAWN_RATE,
  RAIN_RIPPLE_VIEW_MARGIN,
} from './constants'

interface RainRippleField {
  progress: Float32Array
  spawnBudget: number
  nextSlot: number
  activeCount: number
}

export const createRainRippleField = (): RainRippleField => ({
  progress: new Float32Array(RAIN_RIPPLE_MAX).fill(1),
  spawnBudget: 0,
  nextSlot: 0,
  activeCount: 0,
})

function ageRipples(
  field: RainRippleField,
  progressAttribute: THREE.InstancedBufferAttribute,
  dt: number
) {
  const { progress } = field
  let isDirty = false
  for (let i = 0; i < RAIN_RIPPLE_MAX; i++) {
    if (progress[i] >= 1) continue
    progress[i] = Math.min(1, progress[i] + dt / RAIN_RIPPLE_LIFETIME)
    progressAttribute.array[i] = progress[i]
    isDirty = true
    if (progress[i] >= 1) field.activeCount = Math.max(0, field.activeCount - 1)
  }
  return isDirty
}

function spawnRipples(
  field: RainRippleField,
  progressAttribute: THREE.InstancedBufferAttribute,
  centerAttribute: THREE.InstancedBufferAttribute,
  ship: THREE.Object3D | null,
  camera: THREE.OrthographicCamera,
  intensity: number,
  dt: number
) {
  field.spawnBudget += RAIN_RIPPLE_SPAWN_RATE * intensity * dt
  const originX = ship?.position.x ?? 0
  const originZ = ship?.position.z ?? 0
  const halfView = (camera.right / camera.zoom) * RAIN_RIPPLE_VIEW_MARGIN
  let hasSpawned = false

  while (field.spawnBudget >= 1) {
    field.spawnBudget -= 1
    const slot = field.nextSlot % RAIN_RIPPLE_MAX
    field.nextSlot++

    if (field.progress[slot] >= 1) field.activeCount++
    field.progress[slot] = 0
    progressAttribute.array[slot] = 0

    const across = (Math.random() - 0.5) * halfView * 2
    const along = (Math.random() - 0.5) * halfView * 2
    const x = originX + across * SCREEN_RIGHT.x + along * GROUND_FORWARD.x
    const z = originZ + across * SCREEN_RIGHT.z + along * GROUND_FORWARD.y

    centerAttribute.array[slot * 2] = x
    centerAttribute.array[slot * 2 + 1] = z
    hasSpawned = true
    if (Math.random() < algaeAt(x, z)) queueGlowHit(x, z)
  }
  return hasSpawned
}

export function stepRainRipples(
  field: RainRippleField,
  mesh: THREE.Mesh,
  material: THREE.ShaderMaterial,
  ship: THREE.Object3D | null,
  camera: THREE.OrthographicCamera,
  dt: number
) {
  const intensity = useWeatherStore.getState().rainIntensity
  const whirlpool = useWhirlpoolStore.getState()
  material.uniforms.uIntensity.value = intensity
  material.uniforms.uWhirlpoolDrain.value = whirlpool.active ? whirlpool.drainRate : 0

  mesh.visible = intensity > RAIN_RIPPLE_MIN_INTENSITY || field.activeCount > 0
  if (!mesh.visible) return

  const { aProgress, aCenter } = mesh.geometry.attributes as Record<
    string,
    THREE.InstancedBufferAttribute
  >
  const hasAged = ageRipples(field, aProgress, dt)
  const hasSpawned =
    intensity > RAIN_RIPPLE_MIN_INTENSITY &&
    spawnRipples(field, aProgress, aCenter, ship, camera, intensity, dt)
  if (hasAged || hasSpawned) aProgress.needsUpdate = true
  if (hasSpawned) aCenter.needsUpdate = true
}
