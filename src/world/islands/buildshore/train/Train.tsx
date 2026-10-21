import { useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import Headlight from './headlight/Headlight'
import { findLamps } from './headlight/lamps'
import TrainSmoke from './smoke/TrainSmoke'
import { advanceTrain, createTrainMotion } from './trainMotion'
import { poseTrain, type TrainRig } from './trainRig'

interface TrainProps {
  rig: TrainRig
  hover: HoverTimeline
  islandScale: number
}

export default function Train({ rig, hover, islandScale }: TrainProps) {
  const motion = useMemo(() => createTrainMotion(rig.stationDistance), [rig])
  const lamps = useMemo(() => findLamps(rig.locomotive.node), [rig])

  useFrame((_, delta) => {
    advanceTrain(motion, rig.route, rig.stationDistance, Math.min(delta, MAX_FRAME_SECONDS))
    poseTrain(rig, motion)
  })

  return (
    <>
      <TrainSmoke rig={rig} motion={motion} hover={hover} islandScale={islandScale} />
      {lamps &&
        createPortal(<Headlight lamps={lamps} islandScale={islandScale} />, rig.locomotive.node)}
    </>
  )
}
