import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import {
  advanceFairWeatherPresence,
  createFairWeatherPresence,
} from '@/world/islands/shared/fairWeatherPresence'
import { pixelsPerUnit } from '@/utils/screen'
import {
  FIREFLY_BOB,
  FIREFLY_PRESENCE_RATE,
  FIREFLY_RAIN_RATE,
  FIREFLY_SIZE,
  FIREFLY_WANDER,
} from './constants'
import { buildFireflyGeometry, createFireflyMaterial, type FireflyField } from './fireflyModel'
import { nightPresence } from './fireflyPresence'

export default function Fireflies({ islets, center, islandScale, offsetY }: FireflyField) {
  const pointsRef = useRef<THREE.Points>(null)
  const presence = useRef(createFairWeatherPresence())

  const geometry = useMemo(
    () => buildFireflyGeometry({ islets, center, islandScale, offsetY }),
    [islets, center, islandScale, offsetY]
  )
  const material = useMemo(() => createFireflyMaterial(), [])

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

    const level = advanceFairWeatherPresence(
      presence.current,
      nightPresence(useCycleStore.getState().timeOfDay),
      delta,
      FIREFLY_PRESENCE_RATE,
      FIREFLY_RAIN_RATE
    )

    points.visible = level > 0.001
    if (!points.visible) return

    const { uniforms } = points.material as THREE.ShaderMaterial
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uSize.value = FIREFLY_SIZE * pixelsPerUnit(camera, gl)
    uniforms.uWander.value = FIREFLY_WANDER / islandScale
    uniforms.uBob.value = FIREFLY_BOB / islandScale
    uniforms.uPresence.value = level
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      visible={false}
      renderOrder={RENDER_LAYER.glow}
    />
  )
}
