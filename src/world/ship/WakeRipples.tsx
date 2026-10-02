import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { buildFlatQuad } from '@/utils/geometry'
import { createRippleMaterial } from '@/world/effects/rippleModel'
import {
  RIPPLE_MAX_GROUPS,
  RIPPLE_SPRITES_PER_GROUP,
  TOTAL_RIPPLE_SPRITES,
  WAKE_RIPPLE_Y,
} from './constants'
import {
  createRippleSprites,
  drawRippleSprites,
  hideRippleInstances,
  spawnWakeRipples,
} from './rippleSprites'

interface WakeRipplesProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function WakeRipples({ shipRef }: WakeRipplesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const sprites = useRef(createRippleSprites(TOTAL_RIPPLE_SPRITES))
  const groupIndex = useRef(0)
  const lastSpawnPoint = useRef<{ x: number; z: number } | null>(null)
  const geometry = useMemo(() => buildFlatQuad(), [])
  const material = useMemo(() => createRippleMaterial(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (mesh) hideRippleInstances(mesh, TOTAL_RIPPLE_SPRITES)
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(({ clock }) => {
    const ship = shipRef.current
    const mesh = meshRef.current
    if (!ship || !mesh) return

    const wake = useDebugStore.getState().wake
    const time = clock.getElapsedTime()
    const { x, z } = ship.position
    lastSpawnPoint.current ??= { x, z }
    const lastSpawn = lastSpawnPoint.current

    if (Math.hypot(x - lastSpawn.x, z - lastSpawn.z) >= wake.spawnDist) {
      const slotBase = (groupIndex.current % RIPPLE_MAX_GROUPS) * RIPPLE_SPRITES_PER_GROUP
      spawnWakeRipples(sprites.current, slotBase, time, ship, wake)
      groupIndex.current++
      lastSpawn.x = x
      lastSpawn.z = z
    }

    drawRippleSprites(
      sprites.current,
      mesh,
      time,
      wake.rippleLifetime,
      wake.expandSpeed,
      WAKE_RIPPLE_Y
    )
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, TOTAL_RIPPLE_SPRITES]}
      frustumCulled={false}
      renderOrder={4}
    />
  )
}
