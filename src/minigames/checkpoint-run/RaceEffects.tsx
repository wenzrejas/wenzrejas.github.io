import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useCheckpointStore } from '@/store/checkpointStore'
import { isMotionReduced } from '@/store/settingsStore'
import { useShipStore } from '@/store/shipStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import Spray from '@/world/effects/Spray'
import { ParticlePool, updateDrops } from '@/world/effects/particlePool'
import { COURSE_GATES } from './checkpointRun'
import {
  ARCH_COLOR,
  RACE_DROP_POOL,
  RACE_FOAM_POOL,
  RACE_SPRAY_GRAVITY,
  RING_SPARK_GRAVITY,
  RING_SPARK_POOL,
  RING_SPARKS,
  RING_SPLASHES,
  SURGE_SPRAY_FULL_SPEED,
  SURGE_SPRAY_RATE,
} from './constants'
import { emitRingSparks, emitRingSplash, emitSurgeSpray } from './raceSpray'
import { onRingPass } from './ringFeedback'

export default function RaceEffects() {
  const sparksRef = useRef<THREE.InstancedMesh>(null)
  const sparkGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const sparkMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: ARCH_COLOR }), [])
  const sparks = useMemo(() => new ParticlePool(RING_SPARK_POOL), [])
  const foam = useMemo(() => new ParticlePool(RACE_FOAM_POOL), [])
  const drops = useMemo(() => new ParticlePool(RACE_DROP_POOL), [])
  const sprayBudget = useRef(0)

  useEffect(
    () => () => {
      sparkGeometry.dispose()
      sparkMaterial.dispose()
    },
    [sparkGeometry, sparkMaterial]
  )

  useEffect(
    () =>
      onRingPass(({ course, ring, kind }) => {
        if (isMotionReduced()) return
        const gate = COURSE_GATES[course][ring]
        emitRingSparks(sparks, gate, RING_SPARKS[kind])
        emitRingSplash(foam, drops, gate, RING_SPLASHES[kind])
      }),
    [sparks, foam, drops]
  )

  useFrame((_, delta) => {
    const mesh = sparksRef.current
    if (!mesh) return

    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const { run } = useCheckpointStore.getState()
    if (run && run.surgeSeconds > 0 && !isMotionReduced()) {
      const ship = useShipStore.getState()
      const pace = Math.min(1, ship.speed / SURGE_SPRAY_FULL_SPEED)
      sprayBudget.current += SURGE_SPRAY_RATE * run.streak * pace * dt
      for (; sprayBudget.current >= 1; sprayBudget.current -= 1) emitSurgeSpray(foam, drops, ship)
    }
    updateDrops(sparks, mesh, dt, RING_SPARK_GRAVITY)
  })

  return (
    <>
      <instancedMesh
        ref={sparksRef}
        args={[sparkGeometry, sparkMaterial, RING_SPARK_POOL]}
        frustumCulled={false}
        renderOrder={RENDER_LAYER.effectSparks}
      />
      <Spray foam={foam} drops={drops} gravity={RACE_SPRAY_GRAVITY} />
    </>
  )
}
