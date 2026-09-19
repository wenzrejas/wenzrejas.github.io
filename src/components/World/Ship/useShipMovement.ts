import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboardInput } from '../../../hooks/useKeyboardInput'
import { INITIAL_HEADING } from './constants'
import { BOUNDARY_RADIUS } from '../Boundary/constants'
import { REVEAL_SPEED } from '../Islands/constants'
import { ISLAND_KEYS, ISLAND_SPECS } from '../Islands/islandSpecs'
import { createIslandTransform, islandTransform, toWorld } from '../Islands/islandTransform'
import { useDebugStore } from '../../../store/debugStore'
import { useWindStore } from '../../../store/windStore'
import { useWeatherStore } from '../../../store/weatherStore'
import { useRevealStore } from '../../../store/revealStore'
import { mix } from '../../../utils/math'
import { MAX_DT } from '../../../utils/time'

const VELOCITY_LERP = 6
const WIND_ASSIST = 0.3
const WIND_ASSIST_CAP = 2.5

const BLOCKERS = ISLAND_KEYS.filter((key) => ISLAND_SPECS[key].collision.length > 0)

const _transform = createIslandTransform()
const _centre = new THREE.Vector2()

export function useShipMovement(groupRef: RefObject<THREE.Group | null>) {
  const pressedKeys = useKeyboardInput()
  const heading = useRef(INITIAL_HEADING)
  const tilt = useRef(0)
  const velocity = useRef({ x: 0, z: 0 })

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    const dt = isFinite(delta) && delta > 0 ? Math.min(delta, MAX_DT) : 0.016
    const time = clock.getElapsedTime()
    const keys = pressedKeys.current
    const { moveSpeed, turnSpeed, tiltMax, tiltSpeed, baseY, bobAmp, bobSpeed } =
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
    group.position.x += velocity.current.x * dt
    group.position.z += velocity.current.z * dt

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

    // ── Tilt and bob ──────────────────────────────────────────────────────
    const tiltTarget = keys.left ? tiltMax : keys.right ? -tiltMax : 0
    tilt.current += (tiltTarget - tilt.current) * Math.min(1, tiltSpeed * dt)

    group.rotation.y = heading.current
    group.rotation.z = tilt.current
    group.position.y = baseY + Math.sin(time * bobSpeed) * bobAmp * weather.waveAmpMult
  })

  return heading
}
