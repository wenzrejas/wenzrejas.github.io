import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { useDebugStore } from '@/store/debugStore'
import { isLoaderShowing } from '@/store/loadingStore'
import { useRevealStore } from '@/store/revealStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import type { IslandKey } from './constants'
import { enterReachedIsland, REVEAL_TOTAL, revealBlend } from './revealTimeline'
import { sampleGroundFrame } from './viewReach'

interface IslandRevealProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function IslandReveal({ shipRef }: IslandRevealProps) {
  const seen = useRef<Set<IslandKey>>(new Set())
  const isPrimed = useRef(false)
  const elapsed = useRef(-1)

  useFrame(({ camera }, delta) => {
    const ship = shipRef.current
    if (!ship) return

    if (elapsed.current < 0) {
      if (useDebugStore.getState().camera.topView || isCinematicPlaying() || isLoaderShowing())
        return
      sampleGroundFrame(camera)
      const trigger = enterReachedIsland(
        seen.current,
        ship.position.x,
        ship.position.z,
        useDebugStore.getState().islands,
        isPrimed.current
      )
      isPrimed.current = true
      if (!trigger) return

      useRevealStore.getState().target.set(trigger.x, 0, trigger.z)
      useRevealStore.setState({ activeKey: trigger.key })
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
