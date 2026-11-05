import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { disposeAll } from '@/utils/dispose'
import { buildFlatQuad } from '@/utils/geometry'
import { createRippleMaterial } from '@/world/effects/rippleModel'
import { createRippleSprites, hideRippleInstances, type RippleSprite } from './rippleSprites'

interface RippleSpriteMeshProps {
  total: number
  onFrame: (sprites: RippleSprite[], mesh: THREE.InstancedMesh, time: number) => void
}

export default function RippleSpriteMesh({ total, onFrame }: RippleSpriteMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const sprites = useMemo(() => createRippleSprites(total), [total])
  const geometry = useMemo(() => buildFlatQuad(), [])
  const material = useMemo(() => createRippleMaterial(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (mesh) hideRippleInstances(mesh, total)
    return () => disposeAll(geometry, material)
  }, [geometry, material, total])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (mesh) onFrame(sprites, mesh, clock.getElapsedTime())
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, total]}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.effects}
    />
  )
}
