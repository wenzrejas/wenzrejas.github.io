import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playWhaleCall, playWhaleSplash } from '@/audio/wildlifeSounds'
import { eventDelta } from '@/store/cinematicStore'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { wildlifePace } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { useWhaleStore } from '@/store/whaleStore'
import { isOnScreen } from '@/utils/screen'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { ParticlePool } from '@/world/effects/particlePool'
import Spray from '@/world/effects/Spray'
import {
  BREACH_VIEW_MARGIN,
  DROP_GRAVITY,
  DROP_POOL,
  FIRST_CHECK_DELAY,
  FOAM_POOL,
  GONE_VIEW_MARGIN,
  JUMP_SPLASH_STRENGTH,
  LEAVE_VIEW_MARGIN,
  PLUNGE_SPLASH_STRENGTH,
  PRESENCE_RADIUS,
  WHALE_LENGTH,
} from './constants'
import {
  bodyEndsOf,
  createWhale,
  hasClearRun,
  isDaylight,
  isGone,
  updateWhale,
  type Whale,
  type WhaleView,
} from './whaleMotion'
import { buildWhaleGeometry, createWhaleMaterial, whaleUniforms } from './whaleModel'
import { emitSplash, trailWake } from './splash'
import { emitSpout } from './spout'

const _surfaceSpot = new THREE.Vector3()
const _snout = new THREE.Vector3()
const _tail = new THREE.Vector3()
const _view: WhaleView = { isInFrame: false, isInView: false }

export default function Whale() {
  const bodyRef = useRef<THREE.Mesh>(null)
  const bodyGeometry = useMemo(() => buildWhaleGeometry(), [])
  const bodyMaterial = useMemo(() => createWhaleMaterial(), [])

  useEffect(
    () => () => {
      bodyGeometry.dispose()
      bodyMaterial.dispose()
    },
    [bodyGeometry, bodyMaterial]
  )

  const whale = useRef<Whale | null>(null)
  const checkTimer = useRef(FIRST_CHECK_DELAY)
  const foam = useMemo(() => new ParticlePool(FOAM_POOL), [])
  const drops = useMemo(() => new ParticlePool(DROP_POOL), [])

  useFrame(({ clock, camera }, delta) => {
    const body = bodyRef.current
    if (!body) return

    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const time = clock.getElapsedTime()
    const cycle = useCycleStore.getState()

    const ship = useShipStore.getState()
    const { whaleChance, whaleInterval } = useDebugStore.getState().wildlife
    const checkInterval = whaleInterval / wildlifePace()
    checkTimer.current = Math.min(checkTimer.current, checkInterval) - eventDelta(dt)
    if (checkTimer.current <= 0) {
      checkTimer.current = checkInterval
      if (!whale.current && isDaylight(cycle.timeOfDay) && Math.random() < whaleChance) {
        const candidate = createWhale(ship, camera.position)
        if (hasClearRun(candidate)) whale.current = candidate
      }
    }

    const current = whale.current
    if (current) {
      _surfaceSpot.set(current.x, 0, current.z)
      _view.isInFrame = isOnScreen(_surfaceSpot, camera, BREACH_VIEW_MARGIN)
      _view.isInView = isOnScreen(_surfaceSpot, camera, LEAVE_VIEW_MARGIN)
      const stageBefore = current.stage
      updateWhale(current, ship, time, dt, _view)
      if (current.stage === 'charge' && stageBefore !== 'charge') playWhaleCall()

      const y = -current.depth
      const jumping = stageBefore === 'launch' && current.stage === 'flight'
      const plunging = stageBefore === 'flight' && current.stage === 'sound'
      if (jumping) {
        playWhaleSplash('jump')
        emitSplash(foam, drops, current.x, current.z, JUMP_SPLASH_STRENGTH)
      }
      if (plunging) {
        playWhaleSplash('plunge')
        emitSplash(foam, drops, current.x, current.z, PLUNGE_SPLASH_STRENGTH)
      }
      emitSpout(drops, current, dt)
      trailWake(foam, current)

      body.position.set(current.x, y, current.z)
      body.rotation.set(-current.pitch, current.heading, current.bank + current.roll, 'YXZ')
      body.visible = true
      whaleUniforms.uPhase.value = current.phase
      whaleUniforms.uTurnCurve.value = current.turnCurve
      whaleUniforms.uClimbCurve.value = current.climbCurve
      whaleUniforms.uFade.value = current.emergence

      bodyEndsOf(current, _snout, _tail)
      const isOutOfSight =
        !isOnScreen(_snout, camera, GONE_VIEW_MARGIN) &&
        !isOnScreen(_tail, camera, GONE_VIEW_MARGIN)
      if (isGone(current, isOutOfSight)) whale.current = null
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
      <Spray foam={foam} drops={drops} gravity={DROP_GRAVITY} />
    </>
  )
}
