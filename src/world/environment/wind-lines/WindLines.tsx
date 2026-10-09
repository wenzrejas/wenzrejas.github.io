import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { useWeatherStore } from '@/store/weatherStore'
import { uniformsOf } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { WIND_SETTLED_ANGLE, WIND_STREAK_POOL } from './constants'
import { buildWindStreakGeometry, createWindStreakMaterial } from './windStreakModel'
import { advanceStreak, createWindState, spawnStreak, turnWind } from './windStreaks'

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

  useEffect(
    () => () => {
      geometry.dispose()
      for (const material of materials) material.dispose()
    },
    [geometry, materials]
  )

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const tuning = useDebugStore.getState().windLines
    const turning = turnWind(wind.current, dt)

    wind.current.streaks.forEach((streak, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      if (!streak.isActive || !tuning.windEnabled) {
        mesh.visible = false
        return
      }
      advanceStreak(streak, dt)
      mesh.visible = streak.isActive
      mesh.position.set(streak.x, streak.y, streak.z)
      mesh.rotation.y = streak.angle
      mesh.scale.set(streak.length, streak.amplitude, 1)
      const uniforms = uniformsOf(mesh)
      uniforms.uProgress.value = streak.progress
      uniforms.uOpacity.value = tuning.windOpacity
      uniforms.uThickness.value = tuning.lineWidth
    })

    if (!tuning.windEnabled || turning > WIND_SETTLED_ANGLE) return
    const ship = shipRef.current
    const { windMult } = useWeatherStore.getState()
    spawnStreak(
      wind.current,
      clock.getElapsedTime(),
      ship?.position.x ?? 0,
      ship?.position.z ?? 0,
      tuning,
      windMult
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
