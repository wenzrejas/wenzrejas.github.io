import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import {
  advanceFairWeatherPresence,
  createFairWeatherPresence,
} from '@/world/islands/shared/fairWeatherPresence'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import {
  SMOKE_COLOR,
  SMOKE_DRIFT,
  SMOKE_LIGHT_TINT,
  SMOKE_PRESENCE_RATE,
  SMOKE_PUFF_SIZE,
  SMOKE_RAIN_RATE,
} from './constants'
import { COZY_CHIMNEY_TOP } from '../shoreProfile'
import { buildSmokeGeometry, createSmokeMaterial } from './chimneySmokeModel'
import { daytimePresence } from './smokePresence'

const SMOKE_TINT = new THREE.Color(SMOKE_COLOR)

export default function ChimneySmoke({ islandScale }: { islandScale: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const presence = useRef(createFairWeatherPresence())

  const geometry = useMemo(() => buildSmokeGeometry(), [])
  const material = useMemo(() => createSmokeMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock, camera, gl }, delta) => {
    const points = pointsRef.current
    if (!points) return

    const cycle = useCycleStore.getState()
    const level = advanceFairWeatherPresence(
      presence.current,
      daytimePresence(cycle.timeOfDay),
      delta,
      SMOKE_PRESENCE_RATE,
      SMOKE_RAIN_RATE
    )

    points.visible = level > 0.001
    if (!points.visible) return

    const { uniforms } = points.material as THREE.ShaderMaterial
    const wind = useWindStore.getState().dir
    const drift = SMOKE_DRIFT * islandScale * useWeatherStore.getState().windMult

    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uSize.value = SMOKE_PUFF_SIZE * islandScale * pixelsPerUnit(camera, gl)
    uniforms.uDrift.value.set(wind.x * drift, wind.y * drift)
    uniforms.uPresence.value = level
    uniforms.uColor.value.copy(SMOKE_TINT).lerp(cycle.foamColor, SMOKE_LIGHT_TINT)
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={[COZY_CHIMNEY_TOP.x, COZY_CHIMNEY_TOP.y, COZY_CHIMNEY_TOP.z]}
      visible={false}
      renderOrder={RENDER_LAYER.glow}
    />
  )
}
