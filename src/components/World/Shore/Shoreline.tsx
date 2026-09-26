import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useCycleStore } from '../../../store/cycleStore'
import { SHORE_Y } from './constants'
import type { ShoreField } from './shoreField'
import {
  buildShorelineGeometry,
  createFieldTexture,
  createShorelineMaterial,
} from './shorelineModel'

interface ShorelineProps {
  field: ShoreField
  islandScale: number
  offsetY: number
}

export default function Shoreline({ field, islandScale, offsetY }: ShorelineProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createFieldTexture(field), [field])
  const geometry = useMemo(() => buildShorelineGeometry(), [])
  const material = useMemo(() => createShorelineMaterial(), [])

  useEffect(() => () => texture.dispose(), [texture])
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

    const { uniforms } = mesh.material as THREE.ShaderMaterial
    uniforms.uField.value = texture
    uniforms.uFieldSize.value = field.size * islandScale
    uniforms.uIslandScale.value = islandScale
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uColor.value.copy(useCycleStore.getState().foamColor)
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[field.centerX, (SHORE_Y - offsetY) / islandScale, field.centerZ]}
      scale={[field.size, 1, field.size]}
      renderOrder={3}
    />
  )
}
