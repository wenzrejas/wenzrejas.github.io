import * as THREE from 'three'
import type { ShipControls, WakeControls } from '@/app/debug/types'
import { useCycleStore } from '@/store/cycleStore'
import { rand } from '@/utils/math'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'
import { algaeAt, algaeUniforms } from '../wildlife/algae/algaeField'
import {
  FOAM_PLANE_SIZE,
  HULL_BOB_PULSE,
  HULL_RIPPLE_JITTER,
  HULL_RIPPLE_SIZE_MAX,
  HULL_RIPPLE_SIZE_MIN,
  HULL_RIPPLE_SPREAD,
  HULL_RIPPLES_PER_GROUP,
  RIPPLE_SHRINK,
  RIPPLE_SPRITES_PER_GROUP,
  WAKE_RIPPLE_SIZE_MAX,
  WAKE_RIPPLE_SIZE_MIN,
  hullFoamBound,
} from './constants'
import { outlineHalfWidth } from './hullOutline'

export interface RippleSprite {
  alive: boolean
  written: boolean
  spawnTime: number
  x: number
  z: number
  velocityX: number
  velocityZ: number
  size: number
}

const PARKED_Y = -9999

const _dummy = new THREE.Object3D()
const _tint = new THREE.Color()

export const createRippleSprites = (count: number): RippleSprite[] =>
  Array.from({ length: count }, () => ({
    alive: false,
    written: true,
    spawnTime: 0,
    x: 0,
    z: 0,
    velocityX: 0,
    velocityZ: 0,
    size: 1,
  }))

export function hideRippleInstances(mesh: THREE.InstancedMesh, count: number) {
  _dummy.scale.setScalar(0)
  _dummy.updateMatrix()
  for (let i = 0; i < count; i++) mesh.setMatrixAt(i, _dummy.matrix)
  mesh.instanceMatrix.needsUpdate = true
}

function launch(sprite: RippleSprite, time: number, x: number, z: number) {
  sprite.alive = true
  sprite.written = false
  sprite.spawnTime = time
  sprite.x = x
  sprite.z = z
}

export function spawnHullRipples(
  sprites: RippleSprite[],
  slotBase: number,
  time: number,
  ship: THREE.Object3D,
  tuning: ShipControls
) {
  const cos = Math.cos(ship.rotation.y)
  const sin = Math.sin(ship.rotation.y)
  const foamBound =
    hullFoamBound(tuning.modelSize, tuning.foamWidth) -
    Math.sin(time * tuning.bobSpeed) * HULL_BOB_PULSE
  const hullAspect = tuning.modelSize / (2 * foamBound * FOAM_PLANE_SIZE)
  const hullHalf = foamBound * FOAM_PLANE_SIZE
  const jitter = hullHalf * HULL_RIPPLE_JITTER

  for (let i = 0; i < HULL_RIPPLES_PER_GROUP; i++) {
    const share = i / HULL_RIPPLES_PER_GROUP
    const along = share < 0.5 ? share * 4 - 1 : 1 - (share - 0.5) * 4
    const across = (share < 0.5 ? -1 : 1) * outlineHalfWidth(along)

    const localX = across * hullHalf + (Math.random() - 0.5) * jitter
    const localZ = -along * hullHalf * hullAspect + (Math.random() - 0.5) * jitter
    const worldX = ship.position.x + cos * localX + sin * localZ
    const worldZ = ship.position.z - sin * localX + cos * localZ
    const dx = worldX - ship.position.x
    const dz = worldZ - ship.position.z
    const length = Math.sqrt(dx * dx + dz * dz) || 1

    const sprite = sprites[slotBase + i]
    launch(sprite, time, worldX, worldZ)
    sprite.velocityX = dx / length + (Math.random() - 0.5) * HULL_RIPPLE_SPREAD
    sprite.velocityZ = dz / length + (Math.random() - 0.5) * HULL_RIPPLE_SPREAD
    sprite.size = hullHalf * rand(HULL_RIPPLE_SIZE_MIN, HULL_RIPPLE_SIZE_MAX)
  }
}

export function spawnWakeRipples(
  sprites: RippleSprite[],
  slotBase: number,
  time: number,
  ship: THREE.Object3D,
  wake: WakeControls
) {
  const cos = Math.cos(ship.rotation.y)
  const sin = Math.sin(ship.rotation.y)

  for (let i = 0; i < RIPPLE_SPRITES_PER_GROUP; i++) {
    const theta = (i / (RIPPLE_SPRITES_PER_GROUP - 1)) * Math.PI
    const localX = Math.cos(theta) * wake.halfSpread
    const localZ = Math.sin(theta) * wake.rippleDepth
    const worldX = ship.position.x + cos * localX + sin * localZ
    const worldZ = ship.position.z - sin * localX + cos * localZ
    const localLength = Math.sqrt(localX * localX + localZ * localZ) || 1
    const normalX = localX / localLength
    const normalZ = localZ / localLength

    const sprite = sprites[slotBase + i]
    launch(sprite, time, worldX, worldZ)
    sprite.velocityX = cos * normalX + sin * normalZ
    sprite.velocityZ = -sin * normalX + cos * normalZ
    sprite.size = rand(WAKE_RIPPLE_SIZE_MIN, WAKE_RIPPLE_SIZE_MAX)
  }
}

export function drawRippleSprites(
  sprites: RippleSprite[],
  mesh: THREE.InstancedMesh,
  time: number,
  lifetime: number,
  expandSpeed: number,
  surfaceY: number
) {
  const { foamColor } = useCycleStore.getState()
  let isDirty = false

  for (let i = 0; i < sprites.length; i++) {
    const sprite = sprites[i]

    if (!sprite.alive) {
      if (!sprite.written) {
        sprite.written = true
        _dummy.scale.setScalar(0)
        _dummy.position.y = PARKED_Y
        _dummy.updateMatrix()
        mesh.setMatrixAt(i, _dummy.matrix)
        isDirty = true
      }
      continue
    }

    const age = time - sprite.spawnTime
    if (age >= lifetime) {
      sprite.alive = false
      sprite.written = false
      continue
    }

    const progress = age / lifetime
    const x = sprite.x + sprite.velocityX * age * expandSpeed
    const z = sprite.z + sprite.velocityZ * age * expandSpeed
    _dummy.position.set(x, surfaceY - whirlpoolDip(x, z), z)
    _dummy.scale.setScalar(sprite.size * Math.max(0, 1 - progress * RIPPLE_SHRINK))
    _dummy.updateMatrix()
    mesh.setMatrixAt(i, _dummy.matrix)
    _tint.copy(foamColor).lerp(algaeUniforms.uAlgaeGlow.value, algaeAt(x, z))
    mesh.setColorAt(i, _tint)
    isDirty = true
  }

  if (!isDirty) return
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}
