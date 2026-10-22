import { useEffect, useRef, useState, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { useDebugStore } from '@/store/debugStore'
import { isLoaderShowing } from '@/store/loadingStore'
import { useRevealStore } from '@/store/revealStore'
import { onShipPlaced } from '@/store/shipStore'
import { rememberedItems, rememberItem } from '@/store/visitorMemory'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { ISLAND_KEYS } from './islandSpecs'
import {
  enterReachedIsland,
  islandInReach,
  REVEAL_TOTAL,
  revealBlend,
  revealFocus,
  revealScreenTop,
} from './revealTimeline'
import { sampleGroundFrame } from './viewReach'

interface IslandRevealProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function IslandReveal({ shipRef }: IslandRevealProps) {
  const [seen] = useState(() => new Set(rememberedItems('revealedIslands', ISLAND_KEYS)))
  const isPrimed = useRef(false)
  const elapsed = useRef(-1)

  useEffect(
    () =>
      onShipPlaced(() => {
        if (elapsed.current < 0) return
        elapsed.current = -1
        useRevealStore.setState({ blend: 0, activeKey: null })
      }),
    []
  )

  useFrame(({ camera }, delta) => {
    const ship = shipRef.current
    if (!ship) return

    if (elapsed.current < 0) {
      if (useDebugStore.getState().camera.topView || isCinematicPlaying() || isLoaderShowing())
        return
      sampleGroundFrame(camera)
      const tuning = useDebugStore.getState().islands
      const { nearbyIsland } = useRevealStore.getState()
      const nearby = islandInReach(nearbyIsland, ship.position.x, ship.position.z, tuning)
      if (nearby !== nearbyIsland) useRevealStore.setState({ nearbyIsland: nearby })
      const trigger = enterReachedIsland(
        seen,
        ship.position.x,
        ship.position.z,
        tuning,
        isPrimed.current
      )
      isPrimed.current = true
      if (!trigger) return

      rememberItem('revealedIslands', trigger.key)
      revealFocus(trigger, tuning[trigger.key], useRevealStore.getState().target)
      useRevealStore.setState({
        activeKey: trigger.key,
        islandScreenTop: revealScreenTop(trigger, tuning[trigger.key]),
      })
      elapsed.current = 0
    }

    elapsed.current += Math.min(delta, MAX_FRAME_SECONDS)

    if (elapsed.current >= REVEAL_TOTAL) {
      elapsed.current = -1
      useRevealStore.setState({ blend: 0, activeKey: null })
      return
    }

    useRevealStore.getState().blend = revealBlend(elapsed.current)
  })

  return null
}
