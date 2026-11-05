import { useEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboardInput } from '@/hooks/useKeyboardInput'
import { sailingInput } from '@/controls/sailingInput'
import {
  INITIAL_HEADING,
  TAILWIND_ALIGN_FULL,
  TAILWIND_ALIGN_START,
  TAILWIND_RATE,
  SURGE_SHOW_RATE,
  WHIRLPOOL_LEAN_RATE,
} from './constants'
import { BOUNDARY_RADIUS } from '../environment/boundary/constants'
import { REVEAL_SPEED } from '../islands/shared/constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '../islands/shared/islandSpecs'
import { createIslandTransform, islandTransform, toWorld } from '../islands/shared/islandTransform'
import { COURSE_WINDS, surgeBoostOf } from '@/minigames/checkpoint-run/checkpointRun'
import { RACE_WIND_STRENGTH } from '@/minigames/checkpoint-run/constants'
import { glideSpotOf } from '@/minigames/checkpoint-run/raceArrival'
import { useCheckpointStore } from '@/store/checkpointStore'
import { useDebugStore } from '@/store/debugStore'
import { sailingPace } from '@/store/settingsStore'
import { useWindStore } from '@/store/windStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useRevealStore } from '@/store/revealStore'
import { onShipPlaced, useShipStore } from '@/store/shipStore'
import { useCoastStore } from '@/store/coastStore'
import { keepHullOffCoasts } from './hullCollision'
import { shipBobHeight } from './shipBob'
import { whirlpoolCurrent, whirlpoolLean } from './whirlpoolDrift'
import { mix } from '@/utils/math'
import { FALLBACK_FRAME_SECONDS, MAX_FRAME_SECONDS } from '@/utils/time'

const VELOCITY_LERP = 6
const WIND_ASSIST = 0.3
const WIND_ASSIST_CAP = 2.5

const BLOCKERS = ISLAND_KEYS.filter((key) => ISLAND_SPECS[key].collision.length > 0)

const _transform = createIslandTransform()
const _centre = new THREE.Vector2()
const _current = new THREE.Vector2()
const _leanTarget = new THREE.Vector2()

export function useShipMovement(groupRef: RefObject<THREE.Group | null>) {
  const pressedKeys = useKeyboardInput()
  const heading = useRef(INITIAL_HEADING)
  const tilt = useRef(0)
  const steering = useRef(0)
  const tailwind = useRef(0)
  const surgeShow = useRef(0)
  const sailFill = useRef(0)
  const lean = useRef(new THREE.Vector2())
  const velocity = useRef({ x: 0, z: 0 })

  useEffect(
    () =>
      onShipPlaced((ship) => {
        const group = groupRef.current
        if (!group) return
        group.position.x = ship.x
        group.position.z = ship.z
        heading.current = ship.heading - Math.PI
        velocity.current.x = 0
        velocity.current.z = 0
        tilt.current = 0
        tailwind.current = 0
        lean.current.set(0, 0)
      }),
    [groupRef]
  )

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    const dt =
      isFinite(delta) && delta >= 0 ? Math.min(delta, MAX_FRAME_SECONDS) : FALLBACK_FRAME_SECONDS
    const time = clock.getElapsedTime()
    const { throttle, turn, steering: helm } = sailingInput(pressedKeys.current, heading.current)
    const shipTuning = useDebugStore.getState().ship
    const { moveSpeed: baseMoveSpeed, turnSpeed, tiltMax, tiltSpeed, modelSize } = shipTuning
    const { run } = useCheckpointStore.getState()
    const surgeBoost = run ? surgeBoostOf(run) : 0
    const moveSpeed = baseMoveSpeed * (run ? 1 + surgeBoost : sailingPace())
    const wind = run ? COURSE_WINDS[run.course] : useWindStore.getState().dir
    const weather = useWeatherStore.getState()
    const windStrength = run ? RACE_WIND_STRENGTH : weather.windMult
    const reveal = useRevealStore.getState()

    // ── Turning ───────────────────────────────────────────────────────────
    heading.current += turnSpeed * turn * dt

    // ── Velocity with wind assist ─────────────────────────────────────────
    const fwdX = -Math.sin(heading.current)
    const fwdZ = -Math.cos(heading.current)
    const alignment = fwdX * wind.x + fwdZ * wind.y

    let targetVelX = 0
    let targetVelZ = 0
    if (throttle !== 0) {
      const windMult =
        1 + Math.max(0, alignment) * WIND_ASSIST * Math.min(windStrength, WIND_ASSIST_CAP)
      const speed = moveSpeed * mix(1, REVEAL_SPEED, reveal.blend)
      targetVelX = fwdX * speed * windMult * throttle
      targetVelZ = fwdZ * speed * windMult * throttle
    }

    const lerp = Math.min(1, VELOCITY_LERP * dt)
    velocity.current.x += (targetVelX - velocity.current.x) * lerp
    velocity.current.z += (targetVelZ - velocity.current.z) * lerp
    whirlpoolCurrent(group.position.x, group.position.z, _current)
    group.position.x += (velocity.current.x + _current.x) * dt
    group.position.z += (velocity.current.z + _current.y) * dt

    // ── Tailwind ──────────────────────────────────────────────────────────
    const forwardSpeed = velocity.current.x * fwdX + velocity.current.z * fwdZ
    const forwardShare = THREE.MathUtils.clamp(forwardSpeed / Math.max(moveSpeed, 1), 0, 1)
    const tailwindTarget =
      THREE.MathUtils.smoothstep(alignment, TAILWIND_ALIGN_START, TAILWIND_ALIGN_FULL) *
      forwardShare
    tailwind.current += (tailwindTarget - tailwind.current) * Math.min(1, TAILWIND_RATE * dt)
    const surgeTarget = surgeBoost > 0 ? 1 : 0
    surgeShow.current += (surgeTarget - surgeShow.current) * Math.min(1, SURGE_SHOW_RATE * dt)
    sailFill.current = Math.max(tailwind.current, surgeShow.current)

    // ── Boundary clamp ────────────────────────────────────────────────────
    const dist = Math.sqrt(group.position.x ** 2 + group.position.z ** 2)
    if (dist > BOUNDARY_RADIUS) {
      const scale = BOUNDARY_RADIUS / dist
      group.position.x *= scale
      group.position.z *= scale
    }

    // ── Island collision ──────────────────────────────────────────────────
    const tuning = useDebugStore.getState().islands
    for (const key of BLOCKERS) {
      islandTransform(key, tuning[key], _transform)

      for (const circle of ISLAND_SPECS[key].collision) {
        toWorld(_transform, circle.x, circle.z, _centre)
        const r = circle.radius * _transform.scale

        const dx = group.position.x - _centre.x
        const dz = group.position.z - _centre.y
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist > 0 && dist < r) {
          const push = r / dist
          group.position.x = _centre.x + dx * push
          group.position.z = _centre.y + dz * push
        }
      }
    }
    const { collisions } = useCoastStore.getState()
    keepHullOffCoasts(group.position, heading.current, modelSize, collisions)

    // ── Race start glide ──────────────────────────────────────────────────
    if (run?.arrival.phase === 'gliding' && run.placements === useShipStore.getState().placements) {
      const spot = glideSpotOf(run)
      group.position.x = spot.x
      group.position.z = spot.z
      heading.current = spot.heading - Math.PI
      velocity.current.x = 0
      velocity.current.z = 0
    }

    // ── Tilt and bob ──────────────────────────────────────────────────────
    steering.current = helm
    const tiltTarget = steering.current * tiltMax
    tilt.current += (tiltTarget - tilt.current) * Math.min(1, tiltSpeed * dt)

    whirlpoolLean(group.position.x, group.position.z, heading.current, _leanTarget)
    lean.current.lerp(_leanTarget, Math.min(1, WHIRLPOOL_LEAN_RATE * dt))
    group.rotation.set(lean.current.x, heading.current, tilt.current + lean.current.y, 'YXZ')

    const motion = useShipStore.getState()
    motion.x = group.position.x
    motion.z = group.position.z
    motion.vx = velocity.current.x
    motion.vz = velocity.current.z
    motion.speed = Math.hypot(velocity.current.x, velocity.current.z)
    motion.heading = heading.current + Math.PI
    motion.tailwind = tailwind.current
    group.position.y = shipBobHeight(shipTuning, time, group.position.x, group.position.z)
  })

  return { heading, lean, steering, tailwind: sailFill }
}
