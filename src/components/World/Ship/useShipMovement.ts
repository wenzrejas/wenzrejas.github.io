import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useKeyboardInput } from '../../../hooks/useKeyboardInput'
import { INITIAL_HEADING } from './constants'
import { BOUNDARY_RADIUS } from '../Boundary/constants'
import { useDebugStore } from '../../../store/debugStore'
import { useWindStore } from '../../../store/windStore'
import { useWeatherStore } from '../../../store/weatherStore'

const MAX_DT = 0.05
const VELOCITY_LERP = 6
const WIND_ASSIST = 0.3
const WIND_ASSIST_CAP = 2.5

/**
 * Drives the ship group's transform each frame. Returns the heading, which the
 * hull foam needs; call this before any hook that reads the ship's transform,
 * since useFrame callbacks of equal priority run in subscription order.
 */
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
      targetVelX = fwdX * moveSpeed * windMult * direction
      targetVelZ = fwdZ * moveSpeed * windMult * direction
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

    // ── Tilt and bob ──────────────────────────────────────────────────────
    const tiltTarget = keys.left ? tiltMax : keys.right ? -tiltMax : 0
    tilt.current += (tiltTarget - tilt.current) * Math.min(1, tiltSpeed * dt)

    group.rotation.y = heading.current
    group.rotation.z = tilt.current
    group.position.y = baseY + Math.sin(time * bobSpeed) * bobAmp * weather.waveAmpMult
  })

  return heading
}
