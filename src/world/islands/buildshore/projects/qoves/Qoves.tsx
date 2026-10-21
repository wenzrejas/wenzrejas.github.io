import { useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import type { IslandModel } from '@/world/islands/shared/islandModel'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import BlossomDrift from './BlossomDrift'
import { cometHead, findQovesLoop, loopLevel, swellAmberGlow } from './loopLight'
import { dressLoopLight, updateLoopLight } from './loopLightModel'

interface QovesProps {
  island: IslandModel
  hover: HoverTimeline
  islandScale: number
}

export default function Qoves({ island, hover, islandScale }: QovesProps) {
  const loop = useMemo(() => findQovesLoop(island), [island])
  const light = useMemo(() => (loop ? dressLoopLight(loop.stones) : null), [loop])

  useFrame(() => {
    if (!loop || !light) return
    const level = loopLevel(hover)
    updateLoopLight(light, cometHead(hover), level)
    if (loop.amberGlow) swellAmberGlow(loop.amberGlow, nightGlow(), level)
  })

  if (!loop) return null
  return createPortal(<BlossomDrift hover={hover} islandScale={islandScale} />, loop.frame)
}
