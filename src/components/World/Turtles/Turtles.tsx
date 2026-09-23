import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useDebugStore } from '../../../store/debugStore'
import { useShipStore } from '../../../store/shipStore'
import { retain } from '../../../utils/array'
import { rand } from '../../../utils/math'
import { isOnScreen } from '../../../utils/screen'
import { ParticlePool, updateFoam } from '../Effects/particlePool'
import { depthFade } from '../Effects/wildlifeMaterial'
import { isOpenWater } from '../Islands/islandZones'
import {
  CRUISE_DEPTH_MAX,
  DESPAWN_VIEW_MARGIN,
  FADE_START_DEPTH,
  FIRST_CHECK_DELAY,
  HIDDEN_DEPTH,
  MAX_TURTLES,
  NIGHT_CUTOFF,
  PAIR_CHANCE,
  PAIR_GAP_MAX,
  PAIR_GAP_MIN,
  RIPPLE_COUNT,
  RIPPLE_POOL,
  RIPPLE_SPEED,
  SHORE_CLEARANCE,
  SPAWN_DISTANCE_MAX,
  SPAWN_DISTANCE_MIN,
  SPAWN_SPACING,
  SPAWN_VIEW_MARGIN,
} from './constants'
import {
  breathe,
  createTurtle,
  isClearOf,
  separate,
  steer,
  updatePose,
  type Turtle,
} from './turtle'
import { buildTurtleGeometry, createTurtleMaterial } from './turtleModel'

const _dummy = new THREE.Object3D()

function emitRipple(ripples: ParticlePool, turtle: Turtle): void {
  const headX = turtle.x + Math.sin(turtle.heading) * turtle.size * 0.3
  const headZ = turtle.z + Math.cos(turtle.heading) * turtle.size * 0.3
  for (let i = 0; i < RIPPLE_COUNT; i++) {
    const angle = (i / RIPPLE_COUNT) * Math.PI * 2 + rand(-0.2, 0.2)
    const speed = RIPPLE_SPEED * rand(0.7, 1.2)
    ripples.spawn(
      headX + Math.cos(angle) * 1.2,
      0.4,
      headZ + Math.sin(angle) * 1.2,
      Math.cos(angle) * speed,
      0,
      Math.sin(angle) * speed,
      rand(0.8, 1.2),
      rand(1.2, 1.8)
    )
  }
}

export default function Turtles() {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const rippleRef = useRef<THREE.InstancedMesh>(null)

  const bodyGeometry = useMemo(() => buildTurtleGeometry(), [])
  const bodyMaterial = useMemo(() => createTurtleMaterial(), [])
  const rippleGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), [])
  const rippleMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.7, depthWrite: false }),
    []
  )

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

    const dt = Math.min(delta, 0.05)
    const time = clock.getElapsedTime()
    const ship = useShipStore.getState()
    const cycle = useCycleStore.getState()
    const phaseAttr = bodyGeometry.getAttribute('aPhase') as THREE.InstancedBufferAttribute
    const fadeAttr = bodyGeometry.getAttribute('aFade') as THREE.InstancedBufferAttribute
    rippleMaterial.color.copy(cycle.foamColor)

    const { turtleChance, turtleInterval } = useDebugStore.getState().wildlife
    checkTimer.current = Math.min(checkTimer.current, turtleInterval) - dt
    if (checkTimer.current <= 0) {
      checkTimer.current = turtleInterval
      const angle = Math.random() * Math.PI * 2
      const distance = rand(SPAWN_DISTANCE_MIN, SPAWN_DISTANCE_MAX)
      const x = ship.x + Math.sin(angle) * distance
      const z = ship.z + Math.cos(angle) * distance
      _dummy.position.set(x, -CRUISE_DEPTH_MAX, z)
      if (
        turtles.current.length < MAX_TURTLES &&
        cycle.nightFactor < NIGHT_CUTOFF &&
        isOpenWater(x, z, SHORE_CLEARANCE) &&
        isClearOf(turtles.current, x, z, SPAWN_SPACING) &&
        isOnScreen(_dummy.position, camera, SPAWN_VIEW_MARGIN) &&
        Math.random() < turtleChance
      ) {
        const heading = Math.random() * Math.PI * 2
        const leader = createTurtle(x, z, heading)
        const side = Math.sign(Math.random() - 0.5) * rand(PAIR_GAP_MIN, PAIR_GAP_MAX)
        const partnerX = x + Math.cos(heading) * side
        const partnerZ = z - Math.sin(heading) * side
        const pairs =
          turtles.current.length + 1 < MAX_TURTLES &&
          Math.random() < PAIR_CHANCE &&
          isClearOf(turtles.current, partnerX, partnerZ, SPAWN_SPACING)
        turtles.current.push(leader)
        if (pairs) {
          const partner = createTurtle(partnerX, partnerZ, heading)
          partner.seed = leader.seed
          turtles.current.push(partner)
        }
      }
    }

    separate(turtles.current, dt)

    let count = 0
    retain(turtles.current, (turtle) => {
      turtle.age += dt
      if (!turtle.leaving && turtle.age > turtle.lifetime) turtle.leaving = true

      steer(turtle, ship.x, ship.z, time, dt)
      if (breathe(turtle, dt)) emitRipple(ripples, turtle)
      updatePose(turtle, time, dt)

      _dummy.position.set(turtle.x, turtle.y, turtle.z)
      _dummy.rotation.set(-turtle.pitch, turtle.heading, turtle.bank, 'YXZ')
      _dummy.scale.setScalar(turtle.size)
      _dummy.updateMatrix()

      const visible = isOnScreen(_dummy.position, camera, DESPAWN_VIEW_MARGIN)
      const gone = (turtle.leaving && turtle.depth >= HIDDEN_DEPTH) || (!visible && turtle.age > 3)
      if (gone) return false

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
