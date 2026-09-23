import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { useDebugStore } from '../../../store/debugStore'
import { useShipStore } from '../../../store/shipStore'
import { useWhaleStore } from '../../../store/whaleStore'
import { isOnScreen } from '../../../utils/screen'
import { ParticlePool, updateDrops, updateFoam } from '../Effects/particlePool'
import { depthFade } from '../Effects/wildlifeMaterial'
import {
  BREACH_PITCH_BOOST,
  BREACH_PITCH_MAX,
  BREACH_VIEW_MARGIN,
  CRUISE_PITCH_MAX,
  DESPAWN_VIEW_MARGIN,
  DROP_GRAVITY,
  DROP_POOL,
  ENTRY_DROPS,
  EXIT_DROPS,
  FADE_START_DEPTH,
  FIRST_CHECK_DELAY,
  FOAM_POOL,
  HIDDEN_DEPTH,
  NOSE_OFFSET,
  PITCH_SMOOTH,
  PRESENCE_RADIUS,
  WHALE_LENGTH,
} from './constants'
import {
  createWhale,
  hasClearRun,
  isDaylight,
  isGone,
  pose,
  updateWhale,
  type Whale,
} from './whaleMotion'
import { buildWhaleGeometry, createWhaleMaterial, whaleUniforms } from './whaleModel'
import { emitBreachSplash } from './splash'

const _position = new THREE.Vector3()
const { clamp } = THREE.MathUtils

export default function Whale() {
  const bodyRef = useRef<THREE.Mesh>(null)
  const foamRef = useRef<THREE.InstancedMesh>(null)
  const dropsRef = useRef<THREE.InstancedMesh>(null)

  const bodyGeometry = useMemo(() => buildWhaleGeometry(), [])
  const bodyMaterial = useMemo(() => createWhaleMaterial(), [])
  const foamGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), [])
  const dropGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const sprayMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, depthWrite: false }),
    []
  )

  useEffect(
    () => () => {
      for (const resource of [
        bodyGeometry,
        bodyMaterial,
        foamGeometry,
        dropGeometry,
        sprayMaterial,
      ]) {
        resource.dispose()
      }
    },
    [bodyGeometry, bodyMaterial, foamGeometry, dropGeometry, sprayMaterial]
  )

  const whale = useRef<Whale | null>(null)
  const checkTimer = useRef(FIRST_CHECK_DELAY)
  const foam = useMemo(() => new ParticlePool(FOAM_POOL), [])
  const drops = useMemo(() => new ParticlePool(DROP_POOL), [])

  useFrame(({ clock, camera }, delta) => {
    const body = bodyRef.current
    const foamMesh = foamRef.current
    const dropsMesh = dropsRef.current
    if (!body || !foamMesh || !dropsMesh) return

    const dt = Math.min(delta, 0.05)
    const time = clock.getElapsedTime()
    const cycle = useCycleStore.getState()
    sprayMaterial.color.copy(cycle.foamColor)

    const ship = useShipStore.getState()
    const { whaleChance, whaleInterval } = useDebugStore.getState().wildlife
    checkTimer.current = Math.min(checkTimer.current, whaleInterval) - dt
    if (checkTimer.current <= 0) {
      checkTimer.current = whaleInterval
      if (!whale.current && isDaylight(cycle.timeOfDay) && Math.random() < whaleChance) {
        const candidate = createWhale(ship)
        if (hasClearRun(candidate)) whale.current = candidate
      }
    }

    const current = whale.current
    if (current) {
      _position.set(current.x, current.y, current.z)
      const visible = isOnScreen(_position, camera, DESPAWN_VIEW_MARGIN)
      updateWhale(current, ship, time, dt, isOnScreen(_position, camera, BREACH_VIEW_MARGIN))

      const { y, climb, roll } = pose(current)
      const breaching = current.stage === 'breach'
      const pitchLimit = breaching ? BREACH_PITCH_MAX : CRUISE_PITCH_MAX
      const targetPitch = clamp(
        Math.atan2(climb, Math.max(current.speed, 1)) * (breaching ? BREACH_PITCH_BOOST : 1),
        -pitchLimit,
        pitchLimit
      )
      current.pitch += (targetPitch - current.pitch) * Math.min(1, PITCH_SMOOTH * dt)

      const snoutReach = NOSE_OFFSET * WHALE_LENGTH
      const snoutY = y + Math.sin(current.pitch) * snoutReach
      const snoutAhead = Math.cos(current.pitch) * snoutReach
      const leaving = breaching && current.prevSnoutY < 0 && snoutY >= 0
      const entering = breaching && current.prevSnoutY > 0 && snoutY <= 0
      if (leaving || entering) {
        emitBreachSplash(
          foam,
          drops,
          current.x + Math.sin(current.heading) * snoutAhead,
          current.z + Math.cos(current.heading) * snoutAhead,
          current.heading,
          current.speed,
          entering ? ENTRY_DROPS : EXIT_DROPS,
          entering ? 1.4 : 1
        )
      }
      current.prevSnoutY = snoutY
      current.y = y

      body.position.set(current.x, y, current.z)
      body.rotation.set(-current.pitch, current.heading, current.bank + roll, 'YXZ')
      body.visible = true
      whaleUniforms.uPhase.value = current.phase
      whaleUniforms.uFade.value = depthFade(-y, FADE_START_DEPTH, HIDDEN_DEPTH)

      if (isGone(current, visible)) whale.current = null
    } else {
      body.visible = false
    }

    const presence = useWhaleStore.getState()
    presence.active = whale.current !== null
    if (whale.current) {
      presence.x = whale.current.x
      presence.z = whale.current.z
      presence.radius = WHALE_LENGTH * PRESENCE_RADIUS
    }

    updateFoam(foam, foamMesh, dt)
    updateDrops(drops, dropsMesh, dt, DROP_GRAVITY)
  })

  return (
    <>
      <mesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial]}
        scale={WHALE_LENGTH}
        frustumCulled={false}
        visible={false}
      />
      <instancedMesh
        ref={foamRef}
        args={[foamGeometry, sprayMaterial, FOAM_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
      <instancedMesh
        ref={dropsRef}
        args={[dropGeometry, sprayMaterial, DROP_POOL]}
        frustumCulled={false}
        visible={false}
        renderOrder={4}
      />
    </>
  )
}
