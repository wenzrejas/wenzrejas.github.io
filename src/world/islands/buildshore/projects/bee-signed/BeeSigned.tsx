import { useEffect, useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { meshesOf } from '@/utils/meshes'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { dayNightGlow } from '@/world/islands/shared/nightGlow'
import {
  dressColorGlow,
  setColorGlow,
} from '@/world/islands/buildshore/shared/color-glow/colorGlowModel'
import PulseRing from '@/world/islands/buildshore/shared/pulse-ring/PulseRing'
import { findBeeFlight } from './beeFlight'
import BeeSwarm from './BeeSwarm'
import { SEAL_GLOW_DAY_SHARE, SEAL_GLOW_GAIN, SEAL_RING, SEAL_RING_REACH } from './constants'
import { sinkHiveWindows } from './hiveWindowsModel'
import { poseSigning, prepareSigning, sealRingClock } from './signing'

interface BeeSignedProps {
  model: THREE.Object3D
  hover: HoverTimeline
  islandScale: number
}

export default function BeeSigned({ model, hover, islandScale }: BeeSignedProps) {
  const signing = useMemo(() => prepareSigning(model), [model])
  const sealGlow = useMemo(
    () => (signing ? dressColorGlow(meshesOf(signing.seal)) : null),
    [signing]
  )
  const flight = useMemo(
    () => (signing ? findBeeFlight(model, signing.monument) : null),
    [model, signing]
  )

  useEffect(() => sinkHiveWindows(model), [model])

  useFrame(() => {
    if (signing) poseSigning(signing, hover)
    if (sealGlow) setColorGlow(sealGlow, dayNightGlow(SEAL_GLOW_DAY_SHARE) * SEAL_GLOW_GAIN)
  })

  return (
    <>
      {signing &&
        createPortal(
          <PulseRing
            centre={signing.sealRest}
            normal={signing.sealNormal}
            reach={SEAL_RING_REACH}
            tuning={SEAL_RING}
            clock={() => sealRingClock(hover)}
            presence={() => hover.presence}
          />,
          signing.monument
        )}
      {flight && <BeeSwarm flight={flight} hover={hover} islandScale={islandScale} />}
    </>
  )
}
