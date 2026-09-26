import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCoastStore } from '../../../store/coastStore'
import type { IslandKey } from '../Islands/constants'
import { alignCollision, type CoastCollision } from './coastCollision'
import type { DistanceField } from './shoreField'

interface CoastColliderProps {
  islandKey: IslandKey
  field: DistanceField
  islandScale: number
}

export default function CoastCollider({ islandKey, field, islandScale }: CoastColliderProps) {
  const frameRef = useRef<THREE.Group>(null)
  const collisionRef = useRef<CoastCollision | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const collision = { islandKey, field, islandScale, frame, worldToField: new THREE.Matrix4() }
    frame.updateWorldMatrix(true, false)
    alignCollision(collision)
    collisionRef.current = collision
    useCoastStore.setState((state) => ({ collisions: [...state.collisions, collision] }))
    return () => {
      collisionRef.current = null
      useCoastStore.setState((state) => ({
        collisions: state.collisions.filter((entry) => entry !== collision),
      }))
    }
  }, [islandKey, field, islandScale])

  useFrame(() => {
    if (collisionRef.current) alignCollision(collisionRef.current)
  })

  return (
    <group
      ref={frameRef}
      position={[field.centerX, 0, field.centerZ]}
      scale={[field.size, 1, field.size]}
    />
  )
}
