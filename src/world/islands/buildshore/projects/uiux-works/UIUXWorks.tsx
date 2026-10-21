import { useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import GemHalo from '@/world/islands/shared/gem-halo/GemHalo'
import GemSparkles from '@/world/islands/shared/gem-sparkles/GemSparkles'
import { cornerSparkleGem } from '@/world/islands/shared/gem-sparkles/sparkleSpots'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { dayNightGlow, nightGlow } from '@/world/islands/shared/nightGlow'
import {
  dressColorGlow,
  setColorGlow,
} from '@/world/islands/buildshore/shared/color-glow/colorGlowModel'
import DesignCanvas from './design-canvas/DesignCanvas'
import PulseRing from '@/world/islands/buildshore/shared/pulse-ring/PulseRing'
import {
  GEM_GLOW_DAY_SHARE,
  GEM_GLOW_GAIN,
  GEM_HALO,
  GEM_SPARKLES,
  PLAZA_RING,
  PLAZA_RING_REACH,
} from './constants'
import { findGemAwakening, gemGlowLevel, gemLevel, poseGem } from './gemAwakening'
import { haloGemOf } from './haloGem'

const UP = new THREE.Vector3(0, 1, 0)

interface UIUXWorksProps {
  model: THREE.Object3D
  hover: HoverTimeline
  islandScale: number
}

export default function UIUXWorks({ model, hover, islandScale }: UIUXWorksProps) {
  const awakening = useMemo(() => findGemAwakening(model), [model])
  const glow = useMemo(() => (awakening ? dressColorGlow([awakening.gem]) : null), [awakening])
  const halo = useMemo(() => (awakening ? [haloGemOf(awakening.gem)] : []), [awakening])
  const sparkles = useMemo(
    () => (awakening ? cornerSparkleGem(awakening.gem, GEM_SPARKLES) : null),
    [awakening]
  )
  const glowLevel = () => gemGlowLevel(dayNightGlow(GEM_GLOW_DAY_SHARE), hover)

  useFrame(({ clock }, delta) => {
    if (!awakening || !glow) return
    poseGem(
      awakening,
      hover,
      nightGlow(),
      clock.getElapsedTime(),
      Math.min(delta, MAX_FRAME_SECONDS)
    )
    setColorGlow(glow, glowLevel() * GEM_GLOW_GAIN)
  })

  if (!awakening || !sparkles) return null
  return (
    <>
      {createPortal(
        <GemHalo gems={halo} tuning={GEM_HALO} islandScale={islandScale} level={glowLevel} />,
        awakening.gem
      )}
      <GemSparkles
        gem={sparkles}
        tuning={GEM_SPARKLES}
        size={GEM_SPARKLES.size * islandScale}
        level={() => gemLevel(hover)}
      />
      <PulseRing
        centre={awakening.ringCentre}
        normal={UP}
        reach={PLAZA_RING_REACH}
        tuning={PLAZA_RING}
        clock={() => hover.engagedSeconds}
        presence={() => hover.presence}
      />
      <DesignCanvas
        gem={awakening.gem}
        plazaCentre={awakening.ringCentre}
        plazaReach={PLAZA_RING_REACH}
        hover={hover}
      />
    </>
  )
}
