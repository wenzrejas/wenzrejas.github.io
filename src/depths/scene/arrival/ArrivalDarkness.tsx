import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { darknessLevel, type Arrival } from './arrival'
import { shadeDarkness } from './darkness'
import { createDarknessMaterial } from './darknessModel'

interface ArrivalDarknessProps {
  arrival: Arrival
}

export default function ArrivalDarkness({ arrival }: ArrivalDarknessProps) {
  const quadRef = useRef<THREE.Mesh>(null)
  const material = useMemo(() => createDarknessMaterial(), [])

  useEffect(() => () => material.dispose(), [material])

  useFrame(() => {
    const quad = quadRef.current
    if (quad) shadeDarkness(quad, darknessLevel(arrival))
  })

  return (
    <mesh
      ref={quadRef}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.depthsDarkness}
    >
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
