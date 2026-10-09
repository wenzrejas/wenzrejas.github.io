import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { buildFlatQuad } from '@/utils/geometry'
import { createRippleMaterial } from '@/world/effects/rippleModel'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import {
  HULL_RIPPLE_GROUPS,
  HULL_RIPPLE_TOTAL,
  HULL_RIPPLE_Y,
  HULL_RIPPLES_PER_GROUP,
} from './constants'
import type { HullOutline } from './hullOutline'
import {
  createRippleSprites,
  drawRippleSprites,
  hideRippleInstances,
  spawnHullRipples,
} from './rippleSprites'

interface HullRipplesProps {
  shipRef: RefObject<THREE.Group | null>
  hullOutlineRef: RefObject<HullOutline | null>
}

export default function HullRipples({ shipRef, hullOutlineRef }: HullRipplesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const sprites = useRef(createRippleSprites(HULL_RIPPLE_TOTAL))
  const groupIndex = useRef(0)
  const previousBobSign = useRef(1)
  const geometry = useMemo(() => buildFlatQuad(), [])
  const material = useMemo(() => createRippleMaterial(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (mesh) hideRippleInstances(mesh, HULL_RIPPLE_TOTAL)
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(({ clock }) => {
    const ship = shipRef.current
    const mesh = meshRef.current
    if (!ship || !mesh) return

    const tuning = useDebugStore.getState().ship
    const time = clock.getElapsedTime()
    const bobSign = Math.sin(time * tuning.bobSpeed) >= 0 ? 1 : -1
    const hullOutline = hullOutlineRef.current
    if (hullOutline && previousBobSign.current > 0 && bobSign < 0) {
      const slotBase = (groupIndex.current % HULL_RIPPLE_GROUPS) * HULL_RIPPLES_PER_GROUP
      spawnHullRipples(sprites.current, slotBase, time, ship, hullOutline, tuning)
      groupIndex.current++
    }
    previousBobSign.current = bobSign

    drawRippleSprites(sprites.current, mesh, time, tuning.partLife, tuning.partSpeed, HULL_RIPPLE_Y)
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, HULL_RIPPLE_TOTAL]}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.effects}
    />
  )
}
