import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useDebugStore } from '../../../store/debugStore'
import { useShipStore } from '../../../store/shipStore'
import { isRaining } from '../../../store/weatherStore'
import { retain } from '../../../utils/array'
import { rand } from '../../../utils/math'
import { isOnScreen } from '../../../utils/screen'
import { buildBirdGeometry, createBirdMaterial, createShadowMaterial } from './birdModel'
import {
  BANK_FACTOR,
  BANK_LIMIT,
  BOB_AMP,
  FIRST_SPAWN_DELAY,
  FLIGHT_RADIUS,
  MAX_BIRDS,
  NIGHT_CUTOFF,
  SHADOW_MIN_SUN_HEIGHT,
  SHADOW_Y,
  VIEW_MARGIN,
} from './constants'
import { createFlight, steerFlight, updateWings, type Flight } from './flight'
import type { SoundHandle } from '../../../audio/audioManager'
import { SEAGULL_FADE_OUT } from '../../../audio/constants'
import { maybeSeagullCall } from '../../../audio/wildlifeSounds'

const _dummy = new THREE.Object3D()

export default function Birds() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const shadowRef = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => buildBirdGeometry(), [])
  const material = useMemo(() => createBirdMaterial(), [])
  const shadowMaterial = useMemo(() => createShadowMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      shadowMaterial.dispose()
    },
    [geometry, material, shadowMaterial]
  )

  const flights = useRef<Flight[]>([])
  const spawnTimer = useRef(FIRST_SPAWN_DELAY)
  const calls = useRef(new Map<Flight, SoundHandle>())

  useEffect(() => {
    const activeCalls = calls.current
    return () => {
      for (const call of activeCalls.values()) call.stop()
      activeCalls.clear()
    }
  }, [])

  useFrame(({ clock, camera }, delta) => {
    const mesh = meshRef.current
    const shadow = shadowRef.current
    if (!mesh || !shadow) return

    const dt = Math.min(delta, 0.05)
    const time = clock.getElapsedTime()
    const { x: shipX, z: shipZ } = useShipStore.getState()
    const liftAttr = geometry.getAttribute('aLift') as THREE.InstancedBufferAttribute
    const sun = useCycleStore.getState().oceanSunDir
    const sunHeight = Math.max(sun.y, SHADOW_MIN_SUN_HEIGHT)

    const { birdDelayMin, birdDelayMax } = useDebugStore.getState().wildlife
    spawnTimer.current = Math.min(spawnTimer.current, birdDelayMax) - dt
    if (spawnTimer.current <= 0) {
      spawnTimer.current = rand(birdDelayMin, birdDelayMax)
      const active = flights.current.reduce((sum, flight) => sum + flight.birds.length, 0)
      const calm = useCycleStore.getState().nightFactor < NIGHT_CUTOFF && !isRaining()
      if (calm && active < MAX_BIRDS) {
        const flight = createFlight(shipX, shipZ, MAX_BIRDS - active)
        flights.current.push(flight)
        const call = maybeSeagullCall(time)
        if (call) calls.current.set(flight, call)
      }
    }

    let index = 0
    retain(flights.current, (flight) => {
      steerFlight(flight, time, dt)
      const dirX = Math.sin(flight.heading)
      const dirZ = Math.cos(flight.heading)
      const bank = THREE.MathUtils.clamp(-flight.turn * BANK_FACTOR, -BANK_LIMIT, BANK_LIMIT)

      const firstIndex = index
      let onScreen = false

      for (const bird of flight.birds) {
        liftAttr.setX(index, updateWings(bird, dt))

        _dummy.position.set(
          flight.x + dirZ * bird.offsetX + dirX * bird.offsetZ,
          flight.y + bird.offsetY + Math.sin(time * 0.7 + bird.bobPhase) * BOB_AMP,
          flight.z - dirX * bird.offsetX + dirZ * bird.offsetZ
        )
        _dummy.rotation.set(0, flight.heading, bank)
        _dummy.scale.setScalar(bird.size)
        _dummy.updateMatrix()
        mesh.setMatrixAt(index, _dummy.matrix)
        onScreen ||= isOnScreen(_dummy.position, camera, VIEW_MARGIN)

        const drop = _dummy.position.y / sunHeight
        _dummy.position.set(
          _dummy.position.x - sun.x * drop,
          SHADOW_Y,
          _dummy.position.z - sun.z * drop
        )
        _dummy.rotation.set(0, flight.heading, 0)
        _dummy.scale.set(bird.size, 0.01, bird.size)
        _dummy.updateMatrix()
        shadow.setMatrixAt(index, _dummy.matrix)
        onScreen ||= isOnScreen(_dummy.position, camera, VIEW_MARGIN)
        index++
      }

      if (flight.travelled > FLIGHT_RADIUS && !onScreen) {
        calls.current.get(flight)?.stop(SEAGULL_FADE_OUT)
        calls.current.delete(flight)
        index = firstIndex
        return false
      }
      return true
    })

    for (const target of [mesh, shadow]) {
      target.count = index
      target.visible = index > 0
      target.instanceMatrix.needsUpdate = true
    }
    liftAttr.needsUpdate = true
  })

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, MAX_BIRDS]}
        frustumCulled={false}
        visible={false}
      />
      <instancedMesh
        ref={shadowRef}
        args={[geometry, shadowMaterial, MAX_BIRDS]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
    </>
  )
}
