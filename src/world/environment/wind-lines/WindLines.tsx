import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { useWeatherStore } from '@/store/weatherStore'
import { disposeAll } from '@/utils/dispose'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { WIND_SETTLED_ANGLE, WIND_STREAK_POOL } from './constants'
import { buildWindStreakGeometry, createWindStreakMaterial } from './windStreakModel'
import { drawStreaks } from './windStreakLook'
import { createWindState, spawnStreak, turnWind } from './windStreaks'

interface WindLinesProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function WindLines({ shipRef }: WindLinesProps) {
  const geometry = useMemo(() => buildWindStreakGeometry(), [])
  const materials = useMemo(
    () => Array.from({ length: WIND_STREAK_POOL }, () => createWindStreakMaterial()),
    []
  )
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const wind = useRef(createWindState())

  useEffect(() => () => disposeAll(geometry, ...materials), [geometry, materials])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const tuning = useDebugStore.getState().windLines
    const turning = turnWind(wind.current, dt)

    drawStreaks(meshRefs.current, wind.current.streaks, tuning, dt)

    if (!tuning.windEnabled || turning > WIND_SETTLED_ANGLE) return
    const ship = shipRef.current
    const { windMultiplier } = useWeatherStore.getState()
    spawnStreak(
      wind.current,
      clock.getElapsedTime(),
      ship?.position.x ?? 0,
      ship?.position.z ?? 0,
      tuning,
      windMultiplier
    )
  })

  return (
    <>
      {materials.map((material, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            meshRefs.current[i] = mesh
          }}
          geometry={geometry}
          material={material}
          visible={false}
          frustumCulled={false}
          renderOrder={RENDER_LAYER.glow}
        />
      ))}
    </>
  )
}
