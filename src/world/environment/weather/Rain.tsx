import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useWeatherStore } from '@/store/weatherStore'
import { useWindStore } from '@/store/windStore'
import { uniformsOf } from '@/utils/meshes'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { RAIN_VISIBLE_LEVEL } from './constants'
import { buildRainGeometry, createRainMaterial } from './rainModel'

interface RainProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function Rain({ shipRef }: RainProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildRainGeometry(), [])
  const material = useMemo(() => createRainMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const uniforms = uniformsOf(mesh)
    const intensity = useWeatherStore.getState().rainIntensity
    uniforms.uIntensity.value = intensity
    if (intensity <= RAIN_VISIBLE_LEVEL) return

    const wind = useWindStore.getState()
    const ship = shipRef.current
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uWindDir.value.set(wind.dir.x, wind.dir.y)
    uniforms.uShipXZ.value.set(ship?.position.x ?? 0, ship?.position.z ?? 0)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.rain}
    />
  )
}
