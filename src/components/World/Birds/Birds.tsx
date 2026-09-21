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
  BOB_AMP,
  FIRST_SPAWN_DELAY,
  FLIGHT_RADIUS,
  MAX_BIRDS,
  NIGHT_CUTOFF,
  SHADOW_MIN_SUN_HEIGHT,
  SHADOW_Y,
  VIEW_MARGIN,
} from './constants'
import { createFlight, updateWings, type Flight } from './flight'

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
        flights.current.push(createFlight(shipX, shipZ, MAX_BIRDS - active))
      }
    }

    let index = 0
    retain(flights.current, (flight) => {
      flight.heading += flight.turn * dt
      const dirX = Math.sin(flight.heading)
      const dirZ = Math.cos(flight.heading)
      flight.x += dirX * flight.speed * dt
      flight.z += dirZ * flight.speed * dt
      flight.travelled += flight.speed * dt

      const firstIndex = index
      let onScreen = false

      for (const bird of flight.birds) {
        liftAttr.setX(index, updateWings(bird, dt))

        _dummy.position.set(
          flight.x + dirZ * bird.offsetX + dirX * bird.offsetZ,
          flight.y + bird.offsetY + Math.sin(time * 0.7 + bird.bobPhase) * BOB_AMP,
          flight.z - dirX * bird.offsetX + dirZ * bird.offsetZ
        )
        _dummy.rotation.set(0, flight.heading, -flight.turn * BANK_FACTOR)
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
