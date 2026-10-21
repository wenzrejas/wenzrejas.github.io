import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useCycleStore } from '@/store/cycleStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { mix } from '@/utils/math'
import { uniformsOf } from '@/utils/meshes'
import { pixelsPerUnit } from '@/utils/screen'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { ParticlePool } from '@/world/effects/particlePool'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import { BUILDSHORE_SMOKESTACK_TOP } from '@/world/islands/buildshore/shoreProfile'
import type { TrainMotion } from '../trainMotion'
import { pointOnVehicle, type TrainRig } from '../trainRig'
import {
  SMOKE_COLOR,
  SMOKE_DRIFT,
  SMOKE_LIGHT_TINT,
  SMOKE_NIGHT_TINT,
  SMOKE_PUFF_POOL,
} from './constants'
import { advanceSmoke, createSmokeEmitter, emitSmoke, emitWhistle } from './smokePuffs'
import { buildSmokeGeometry, createSmokeMaterial, markSmokeChanged } from './trainSmokeModel'

const SMOKE_TINT = new THREE.Color(SMOKE_COLOR)
const _stackTop = new THREE.Vector3()

interface TrainSmokeProps {
  rig: TrainRig
  motion: TrainMotion
  hover: HoverTimeline
  islandScale: number
}

export default function TrainSmoke({ rig, motion, hover, islandScale }: TrainSmokeProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const pool = useMemo(() => new ParticlePool(SMOKE_PUFF_POOL), [])
  const emitter = useMemo(() => createSmokeEmitter(), [])
  const { geometry, buffers } = useMemo(() => buildSmokeGeometry(), [])
  const material = useMemo(() => createSmokeMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ camera, gl }, delta) => {
    const points = pointsRef.current
    if (!points) return

    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    pointOnVehicle(rig, rig.locomotive, BUILDSHORE_SMOKESTACK_TOP, _stackTop)
    emitSmoke(pool, emitter, _stackTop, motion.travel, motion.speed, dt)
    emitWhistle(pool, emitter, _stackTop, hover, dt)
    advanceSmoke(pool, buffers, dt)
    markSmokeChanged(points.geometry)

    const wind = useWindStore.getState().dir
    const drift = SMOKE_DRIFT * islandScale * useWeatherStore.getState().windMult
    const uniforms = uniformsOf(points)
    uniforms.uSize.value = islandScale * pixelsPerUnit(camera, gl)
    uniforms.uDrift.value.set(wind.x * drift, wind.y * drift)
    uniforms.uColor.value
      .copy(SMOKE_TINT)
      .lerp(
        useCycleStore.getState().foamColor,
        mix(SMOKE_LIGHT_TINT, SMOKE_NIGHT_TINT, nightGlow())
      )
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.glow}
    />
  )
}
