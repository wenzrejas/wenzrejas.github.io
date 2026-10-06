import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboardInput, type Keys } from '@/hooks/useKeyboardInput'
import { INITIAL_HEADING, WHIRLPOOL_LEAN_RATE } from './constants'
import { BOUNDARY_RADIUS } from '../environment/boundary/constants'
import { REVEAL_SPEED } from '../islands/shared/constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '../islands/shared/islandSpecs'
import { createIslandTransform, islandTransform, toWorld } from '../islands/shared/islandTransform'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { useDebugStore } from '@/store/debugStore'
import { isLoaderShowing } from '@/store/loadingStore'
import { isPanelOpen } from '@/store/panelStore'
import { isWorldInView } from '@/store/viewStore'
import { useWindStore } from '@/store/windStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useRevealStore } from '@/store/revealStore'
import { useShipStore } from '@/store/shipStore'
import { useCoastStore } from '@/store/coastStore'
import { keepHullOffCoasts } from './hullCollision'
import { whirlpoolCurrent, whirlpoolLean } from './whirlpoolDrift'
import { mix } from '@/utils/math'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'
import { FALLBACK_FRAME_SECONDS, MAX_FRAME_SECONDS } from '@/utils/time'

const VELOCITY_LERP = 6
const WIND_ASSIST = 0.3
const WIND_ASSIST_CAP = 2.5

const BLOCKERS = ISLAND_KEYS.filter((key) => ISLAND_SPECS[key].collision.length > 0)
const IDLE_KEYS: Keys = { forward: false, backward: false, left: false, right: false }

const _transform = createIslandTransform()
const _centre = new THREE.Vector2()
const _current = new THREE.Vector2()
const _leanTarget = new THREE.Vector2()

export function useShipMovement(groupRef: RefObject<THREE.Group | null>) {
  const pressedKeys = useKeyboardInput()
  const heading = useRef(INITIAL_HEADING)
  const tilt = useRef(0)
  const lean = useRef(new THREE.Vector2())
  const velocity = useRef({ x: 0, z: 0 })

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    const dt =
      isFinite(delta) && delta > 0 ? Math.min(delta, MAX_FRAME_SECONDS) : FALLBACK_FRAME_SECONDS
    const time = clock.getElapsedTime()
    const keys =
      isLoaderShowing() || isCinematicPlaying() || isPanelOpen() || !isWorldInView()
        ? IDLE_KEYS
        : pressedKeys.current
    const { moveSpeed, turnSpeed, tiltMax, tiltSpeed, baseY, bobAmp, bobSpeed, modelSize } =
      useDebugStore.getState().ship
    const wind = useWindStore.getState()
    const weather = useWeatherStore.getState()
    const reveal = useRevealStore.getState()

    // ── Turning ───────────────────────────────────────────────────────────
    if (keys.left) heading.current += turnSpeed * dt
    if (keys.right) heading.current -= turnSpeed * dt

    // ── Velocity with wind assist ─────────────────────────────────────────
    const fwdX = -Math.sin(heading.current)
    const fwdZ = -Math.cos(heading.current)

    let targetVelX = 0
    let targetVelZ = 0
    if (keys.forward || keys.backward) {
      const direction = keys.forward ? 1 : -1
      const alignment = fwdX * wind.dir.x + fwdZ * wind.dir.y
      const windMult =
        1 + Math.max(0, alignment) * WIND_ASSIST * Math.min(weather.windMult, WIND_ASSIST_CAP)
      const speed = moveSpeed * mix(1, REVEAL_SPEED, reveal.blend)
      targetVelX = fwdX * speed * windMult * direction
      targetVelZ = fwdZ * speed * windMult * direction
    }

    const lerp = Math.min(1, VELOCITY_LERP * dt)
    velocity.current.x += (targetVelX - velocity.current.x) * lerp
    velocity.current.z += (targetVelZ - velocity.current.z) * lerp
    whirlpoolCurrent(group.position.x, group.position.z, _current)
    group.position.x += (velocity.current.x + _current.x) * dt
    group.position.z += (velocity.current.z + _current.y) * dt

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

    // ── Tilt and bob ──────────────────────────────────────────────────────
    const tiltTarget = keys.left ? tiltMax : keys.right ? -tiltMax : 0
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
    group.position.y =
      baseY +
      Math.sin(time * bobSpeed) * bobAmp * weather.waveAmpMult -
      whirlpoolDip(group.position.x, group.position.z)
  })

  return { heading, lean }
}
