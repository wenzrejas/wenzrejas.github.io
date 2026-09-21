import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  REVEAL_FALL,
  REVEAL_HOLD,
  REVEAL_LEAD,
  REVEAL_RISE,
  WORLD_LOCATIONS,
  type IslandConfig,
  type IslandKey,
} from './constants'
import { groundReach, sampleGroundFrame } from './viewReach'
import { islandExtent } from './islandTransform'
import { useRevealStore } from '../../../store/revealStore'
import { useDebugStore } from '../../../store/debugStore'
import { MAX_DT } from '../../../utils/time'

const REVEAL_TOTAL = REVEAL_RISE + REVEAL_HOLD + REVEAL_FALL

const TRIGGERS = (Object.entries(WORLD_LOCATIONS) as [IslandKey, IslandConfig][]).map(
  ([key, config]) => ({ key, x: config.position[0], z: config.position[2] })
)

function envelope(elapsed: number): number {
  if (elapsed < REVEAL_RISE) return THREE.MathUtils.smoothstep(elapsed, 0, REVEAL_RISE)
  const falling = elapsed - REVEAL_RISE - REVEAL_HOLD
  if (falling <= 0) return 1
  return 1 - THREE.MathUtils.smoothstep(falling, 0, REVEAL_FALL)
}

interface IslandRevealProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function IslandReveal({ shipRef }: IslandRevealProps) {
  const seen = useRef<Set<IslandKey>>(new Set())
  const primed = useRef(false)
  const elapsed = useRef(-1)

  useFrame(({ camera }, delta) => {
    const ship = shipRef.current
    if (!ship) return

    if (elapsed.current < 0) {
      if (useDebugStore.getState().camera.topView) return
      sampleGroundFrame(camera)
      const tuning = useDebugStore.getState().islands
      let started = false

      for (const trigger of TRIGGERS) {
        if (seen.current.has(trigger.key)) continue
        const dx = ship.position.x - trigger.x
        const dz = ship.position.z - trigger.z
        const range =
          groundReach(dx, dz) + islandExtent(trigger.key, tuning[trigger.key]) + REVEAL_LEAD
        if (dx * dx + dz * dz >= range * range) continue

        seen.current.add(trigger.key)
        if (primed.current) {
          useRevealStore.getState().target.set(trigger.x, 0, trigger.z)
          useRevealStore.setState({ activeKey: trigger.key })
          elapsed.current = 0
          started = true
          break
        }
      }

      primed.current = true
      if (!started) return
    }

    elapsed.current += Math.min(delta, MAX_DT)

    if (elapsed.current >= REVEAL_TOTAL) {
      elapsed.current = -1
      useRevealStore.setState({ blend: 0, activeKey: null })
      return
    }

    useRevealStore.getState().blend = envelope(elapsed.current)
  })

  return null
}
