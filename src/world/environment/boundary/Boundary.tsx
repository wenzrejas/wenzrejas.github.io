import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { IS_DEBUG } from '@/app/experience/constants'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useDebugStore } from '@/store/debugStore'
import { disposeAll } from '@/utils/dispose'
import { paintBoundaryFog } from './boundaryFog'
import { buildFogShells, createFogMaterial } from './boundaryFogModel'

function BoundaryFog() {
  const geometry = useMemo(() => buildFogShells(), [])
  const material = useMemo(() => createFogMaterial(), [])

  useEffect(() => () => disposeAll(geometry, material), [geometry, material])

  useFrame(({ clock }) => paintBoundaryFog(material.uniforms, clock.getElapsedTime()))

  return (
    <mesh
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.fog}
    />
  )
}

function BoundaryRing() {
  const { radius } = useDebugStore((state) => state.boundary)
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={3} renderOrder={RENDER_LAYER.guide}>
      <ringGeometry args={[radius - 1, radius + 1, 128]} />
      <meshBasicMaterial
        color="#ff4444"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Boundary() {
  return (
    <>
      <BoundaryFog />
      {IS_DEBUG && <BoundaryRing />}
    </>
  )
}
