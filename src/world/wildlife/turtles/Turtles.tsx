import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { eventDelta } from '@/store/cinematicStore'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { useShipStore } from '@/store/shipStore'
import { retain } from '@/utils/array'
import { buildFlatQuad } from '@/utils/geometry'
import { isOnScreen } from '@/utils/screen'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { ParticlePool, updateFoam } from '@/world/effects/particlePool'
import { createRippleMaterial } from '@/world/effects/rippleModel'
import { depthFade } from '../shared/wildlifeMaterial'
import {
  DESPAWN_GRACE,
  DESPAWN_VIEW_MARGIN,
  FADE_START_DEPTH,
  FIRST_CHECK_DELAY,
  HIDDEN_DEPTH,
  MAX_TURTLES,
  RIPPLE_POOL,
} from './constants'
import {
  breathe,
  emitBreathRipple,
  separate,
  spawnTurtles,
  steer,
  updatePose,
  type Turtle,
} from './turtle'
import { buildTurtleGeometry, createTurtleMaterial } from './turtleModel'

const _dummy = new THREE.Object3D()

export default function Turtles() {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const rippleRef = useRef<THREE.InstancedMesh>(null)

  const bodyGeometry = useMemo(() => buildTurtleGeometry(), [])
  const bodyMaterial = useMemo(() => createTurtleMaterial(), [])
  const rippleGeometry = useMemo(() => buildFlatQuad(), [])
  const rippleMaterial = useMemo(() => createRippleMaterial(), [])

  useEffect(
    () => () => {
      bodyGeometry.dispose()
      bodyMaterial.dispose()
      rippleGeometry.dispose()
      rippleMaterial.dispose()
    },
    [bodyGeometry, bodyMaterial, rippleGeometry, rippleMaterial]
  )

  const turtles = useRef<Turtle[]>([])
  const ripples = useMemo(() => new ParticlePool(RIPPLE_POOL), [])
  const checkTimer = useRef(FIRST_CHECK_DELAY)

  useFrame(({ clock, camera }, delta) => {
    const body = bodyRef.current
    const rippleMesh = rippleRef.current
    if (!body || !rippleMesh) return

    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const time = clock.getElapsedTime()
    const ship = useShipStore.getState()
    const cycle = useCycleStore.getState()
    const phaseAttr = bodyGeometry.getAttribute('aPhase') as THREE.InstancedBufferAttribute
    const fadeAttr = bodyGeometry.getAttribute('aFade') as THREE.InstancedBufferAttribute
    rippleMaterial.color.copy(cycle.foamColor)

    const { turtleChance, turtleInterval } = useDebugStore.getState().wildlife
    checkTimer.current = Math.min(checkTimer.current, turtleInterval) - eventDelta(dt)
    if (checkTimer.current <= 0) {
      checkTimer.current = turtleInterval
      spawnTurtles(turtles.current, ship.x, ship.z, camera, cycle.nightFactor, turtleChance)
    }

    separate(turtles.current, dt)

    let count = 0
    retain(turtles.current, (turtle) => {
      turtle.age += dt
      if (!turtle.leaving && turtle.age > turtle.lifetime) turtle.leaving = true

      steer(turtle, ship.x, ship.z, time, dt)
      if (breathe(turtle, dt)) emitBreathRipple(ripples, turtle)
      updatePose(turtle, time, dt)

      _dummy.position.set(turtle.x, turtle.y, turtle.z)
      _dummy.rotation.set(-turtle.pitch, turtle.heading, turtle.bank, 'YXZ')
      _dummy.scale.setScalar(turtle.size)
      _dummy.updateMatrix()

      const isVisible = isOnScreen(_dummy.position, camera, DESPAWN_VIEW_MARGIN)
      const isGone =
        (turtle.leaving && turtle.depth >= HIDDEN_DEPTH) ||
        (!isVisible && turtle.age > DESPAWN_GRACE)
      if (isGone) return false

      body.setMatrixAt(count, _dummy.matrix)
      phaseAttr.setX(count, turtle.phase)
      fadeAttr.setX(count, depthFade(turtle.depth, FADE_START_DEPTH, HIDDEN_DEPTH))
      count++
      return true
    })

    body.count = count
    body.visible = count > 0
    if (count > 0) {
      body.instanceMatrix.needsUpdate = true
      phaseAttr.needsUpdate = true
      fadeAttr.needsUpdate = true
    }

    updateFoam(ripples, rippleMesh, dt)
  })

  return (
    <>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, MAX_TURTLES]}
        frustumCulled={false}
        visible={false}
      />
      <instancedMesh
        ref={rippleRef}
        args={[rippleGeometry, rippleMaterial, RIPPLE_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
    </>
  )
}
