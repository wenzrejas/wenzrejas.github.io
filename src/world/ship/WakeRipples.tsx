import { useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import {
  RIPPLE_MAX_GROUPS,
  RIPPLE_SPRITES_PER_GROUP,
  TOTAL_RIPPLE_SPRITES,
  WAKE_RIPPLE_Y,
} from './constants'
import RippleSpriteMesh from './RippleSpriteMesh'
import { drawRippleSprites, spawnWakeRipples, type RippleSprite } from './rippleSprites'
import { isShipHidden } from './shipFade'

interface WakeRipplesProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function WakeRipples({ shipRef }: WakeRipplesProps) {
  const groupIndex = useRef(0)
  const lastSpawnPoint = useRef<{ x: number; z: number } | null>(null)

  const stepWake = (sprites: RippleSprite[], mesh: THREE.InstancedMesh, time: number) => {
    const ship = shipRef.current
    if (!ship) return

    const wake = useDebugStore.getState().wake
    const { x, z } = ship.position
    lastSpawnPoint.current ??= { x, z }
    const lastSpawn = lastSpawnPoint.current

    if (isShipHidden()) {
      lastSpawn.x = x
      lastSpawn.z = z
    } else if (Math.hypot(x - lastSpawn.x, z - lastSpawn.z) >= wake.spawnDistance) {
      const slotBase = (groupIndex.current % RIPPLE_MAX_GROUPS) * RIPPLE_SPRITES_PER_GROUP
      spawnWakeRipples(sprites, slotBase, time, ship, wake)
      groupIndex.current++
      lastSpawn.x = x
      lastSpawn.z = z
    }

    drawRippleSprites(sprites, mesh, time, wake.rippleLifetime, wake.expandSpeed, WAKE_RIPPLE_Y)
  }

  return <RippleSpriteMesh total={TOTAL_RIPPLE_SPRITES} onFrame={stepWake} />
}
