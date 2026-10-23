import { useEffect, useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import DriftPoints from '../shared/DriftPoints'
import type { MilestoneProps } from '../shared/milestone'
import { wakeShare, wakeStrength } from '../shared/ruinWake'
import { BOOK_DUST, BOOK_DUST_ORIGIN, PAGE_GLOW_CENTER } from './constants'
import { buildPageGlow, createPageGlowMaterial } from './pageGlowModel'
import { glowSpread } from './spreadGlow'

export default function OpenBook({ ruin, level, timeline, clock }: MilestoneProps) {
  const geometry = useMemo(() => buildPageGlow(), [])
  const material = useMemo(() => createPageGlowMaterial(), [])
  const strength = () => wakeStrength(wakeShare(timeline, level))

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(() => glowSpread(material, ruin, clock.elapsed, strength()), RUIN_LIFE_FRAME_PRIORITY)

  return (
    <>
      {createPortal(
        <mesh
          geometry={geometry}
          material={material}
          position={PAGE_GLOW_CENTER}
          frustumCulled={false}
          renderOrder={RENDER_LAYER.glow}
        />,
        ruin
      )}
      <DriftPoints
        node={ruin}
        origin={BOOK_DUST_ORIGIN}
        tuning={BOOK_DUST}
        clock={clock}
        glow={strength}
      />
    </>
  )
}
