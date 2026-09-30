import { useEffect, useEffectEvent, useRef } from 'react'
import type { Vector3 } from '@react-three/fiber'
import type * as THREE from 'three'
import { HIT_AREA_COLOR, INTERACTION_LAYER } from './constants'
import { interactions } from './interactionManager'

interface HitAreaProps {
  position?: Vector3
  size: THREE.Vector3Tuple
  onHover: (isHovered: boolean) => void
  onActivate?: () => void
}

export default function HitArea({ position, size, onHover, onActivate }: HitAreaProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const hover = useEffectEvent(onHover)
  const activate = useEffectEvent(() => onActivate?.())
  const isActivatable = onActivate !== undefined

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    return interactions.register(mesh, {
      onHover: (isHovered) => hover(isHovered),
      onActivate: isActivatable ? () => activate() : undefined,
    })
  }, [isActivatable])

  return (
    <mesh ref={meshRef} position={position} layers={INTERACTION_LAYER}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={HIT_AREA_COLOR} wireframe />
    </mesh>
  )
}
