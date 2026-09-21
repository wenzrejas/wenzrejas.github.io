import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCycleStore } from '../../../../store/cycleStore'
import { isRaining } from '../../../../store/weatherStore'
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
  const presence = useRef(0)
  const dryness = useRef(1)

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

    const dt = Math.min(delta, 0.05)
    const dry = isRaining() ? 0 : 1
    dryness.current += (dry - dryness.current) * Math.min(1, FIREFLY_RAIN_RATE * dt)

    const target = nightPresence(useCycleStore.getState().timeOfDay) * dryness.current
    presence.current += (target - presence.current) * Math.min(1, FIREFLY_PRESENCE_RATE * dt)

    points.visible = presence.current > 0.001
    if (!points.visible) return

    const { uniforms } = points.material as THREE.ShaderMaterial
    const zoom = (camera as THREE.OrthographicCamera).zoom
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uSize.value = FIREFLY_SIZE * zoom * gl.getPixelRatio()
    uniforms.uWander.value = FIREFLY_WANDER / islandScale
    uniforms.uBob.value = FIREFLY_BOB / islandScale
    uniforms.uPresence.value = presence.current
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      visible={false}
      renderOrder={5}
    />
  )
}
