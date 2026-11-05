import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { disposeAll } from '@/utils/dispose'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { createRainRippleField, stepRainRipples } from './rainRippleField'
import { buildRainRippleGeometry, createRainRippleMaterial } from './rainRippleModel'

interface RainRipplesProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function RainRipples({ shipRef }: RainRipplesProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildRainRippleGeometry(), [])
  const material = useMemo(() => createRainRippleMaterial(), [])
  const field = useMemo(() => createRainRippleField(), [])

  useEffect(() => () => disposeAll(geometry, material), [geometry, material])

  useFrame(({ camera }, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    stepRainRipples(field, mesh, material, shipRef.current, camera as THREE.OrthographicCamera, dt)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.rainRipples}
    />
  )
}
