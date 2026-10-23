import { useEffect, useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import { useDepthsStore } from '@/store/depthsStore'
import type { MilestoneProps } from '../shared/milestone'
import { wakeShare } from '../shared/ruinWake'
import { buildChimeRing, createChimeRingMaterial } from './chimeRingModel'
import {
  chimeProgress,
  findChronometer,
  glowCabochon,
  listenForLanding,
  ringChime,
  stepClockRewind,
  tickClock,
} from './clockTime'
import { CHIME_FACE_CENTER } from './constants'

export default function Chronometer({ ruin, level, timeline, surfacing, clock }: MilestoneProps) {
  const chronometer = useMemo(() => findChronometer(ruin), [ruin])
  const geometry = useMemo(() => buildChimeRing(), [])
  const material = useMemo(() => createChimeRingMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(() => {
    const epochSeconds = Date.now() / 1000
    stepClockRewind(chronometer, surfacing, clock.delta)
    listenForLanding(chronometer, useDepthsStore.getState().isShipLanded, clock.elapsed)
    tickClock(chronometer, epochSeconds)
    glowCabochon(chronometer, epochSeconds, clock.elapsed, wakeShare(timeline, level))
    ringChime(material, chimeProgress(chronometer, clock.elapsed))
  }, RUIN_LIFE_FRAME_PRIORITY)

  return createPortal(
    <mesh
      geometry={geometry}
      material={material}
      position={CHIME_FACE_CENTER}
      frustumCulled={false}
      renderOrder={RENDER_LAYER.glow}
    />,
    ruin
  )
}
