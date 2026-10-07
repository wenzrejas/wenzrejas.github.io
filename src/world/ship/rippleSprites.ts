import * as THREE from 'three'
import type { ShipControls, WakeControls } from '@/app/debug/types'
import { useCycleStore } from '@/store/cycleStore'
import { rand } from '@/utils/math'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'
import { algaeAt, algaeUniforms } from '../wildlife/algae/algaeField'
import {
  HULL_RIPPLE_JITTER,
  HULL_RIPPLE_SIZE_MAX,
  HULL_RIPPLE_SIZE_MIN,
  HULL_RIPPLE_SPREAD,
  HULL_RIPPLES_PER_GROUP,
  MODEL_BOW_OFFSET,
  RIPPLE_SHRINK,
  RIPPLE_SPRITES_PER_GROUP,
  WAKE_RIPPLE_SIZE_MAX,
  WAKE_RIPPLE_SIZE_MIN,
  WAKE_STERN_SHIFT,
} from './constants'
import {
  edgePointAt,
  foamEdgeCells,
  foamReachAt,
  type EdgePoint,
  type HullOutline,
} from './hullOutline'

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
const _edgePoint: EdgePoint = { x: 0, z: 0, outwardX: 0, outwardZ: 0 }

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
  { field, modelScale }: HullOutline,
  tuning: ShipControls
) {
  const edge = foamEdgeCells(field, foamReachAt(tuning, time) / modelScale)
  if (edge.length === 0) return

  const yaw = ship.rotation.y + MODEL_BOW_OFFSET
  const cos = Math.cos(yaw)
  const sin = Math.sin(yaw)

  for (let i = 0; i < HULL_RIPPLES_PER_GROUP; i++) {
    const cell = edge[Math.floor((i * edge.length) / HULL_RIPPLES_PER_GROUP)]
    const point = edgePointAt(field, cell, _edgePoint)
    const hullX = point.x * modelScale + (Math.random() - 0.5) * HULL_RIPPLE_JITTER
    const hullZ = point.z * modelScale + (Math.random() - 0.5) * HULL_RIPPLE_JITTER
    const outwardX = cos * point.outwardX + sin * point.outwardZ
    const outwardZ = -sin * point.outwardX + cos * point.outwardZ

    const sprite = sprites[slotBase + i]
    launch(
      sprite,
      time,
      ship.position.x + cos * hullX + sin * hullZ,
      ship.position.z - sin * hullX + cos * hullZ
    )
    sprite.velocityX = outwardX + (Math.random() - 0.5) * HULL_RIPPLE_SPREAD
    sprite.velocityZ = outwardZ + (Math.random() - 0.5) * HULL_RIPPLE_SPREAD
    sprite.size = rand(HULL_RIPPLE_SIZE_MIN, HULL_RIPPLE_SIZE_MAX)
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
    const worldX = ship.position.x + cos * localX + sin * (localZ + WAKE_STERN_SHIFT)
    const worldZ = ship.position.z - sin * localX + cos * (localZ + WAKE_STERN_SHIFT)
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
