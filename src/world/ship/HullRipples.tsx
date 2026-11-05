import { useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import {
  HULL_RIPPLE_GROUPS,
  HULL_RIPPLE_TOTAL,
  HULL_RIPPLE_Y,
  HULL_RIPPLES_PER_GROUP,
} from './constants'
import type { HullOutline } from './hullOutline'
import RippleSpriteMesh from './RippleSpriteMesh'
import { drawRippleSprites, spawnHullRipples, type RippleSprite } from './rippleSprites'
import { isShipHidden } from './shipFade'

interface HullRipplesProps {
  shipRef: RefObject<THREE.Group | null>
  hullOutlineRef: RefObject<HullOutline | null>
}

export default function HullRipples({ shipRef, hullOutlineRef }: HullRipplesProps) {
  const groupIndex = useRef(0)
  const previousBobSign = useRef(1)

  const stepHull = (sprites: RippleSprite[], mesh: THREE.InstancedMesh, time: number) => {
    const ship = shipRef.current
    if (!ship) return

    const tuning = useDebugStore.getState().ship
    const bobSign = Math.sin(time * tuning.bobSpeed) >= 0 ? 1 : -1
    const hullOutline = hullOutlineRef.current
    if (hullOutline && previousBobSign.current > 0 && bobSign < 0 && !isShipHidden()) {
      const slotBase = (groupIndex.current % HULL_RIPPLE_GROUPS) * HULL_RIPPLES_PER_GROUP
      spawnHullRipples(sprites, slotBase, time, ship, hullOutline, tuning)
      groupIndex.current++
    }
    previousBobSign.current = bobSign

    drawRippleSprites(sprites, mesh, time, tuning.particleLife, tuning.particleSpeed, HULL_RIPPLE_Y)
  }

  return <RippleSpriteMesh total={HULL_RIPPLE_TOTAL} onFrame={stepHull} />
}
