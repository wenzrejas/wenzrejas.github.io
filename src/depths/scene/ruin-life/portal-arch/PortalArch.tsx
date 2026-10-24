import { useEffect, useMemo } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { RUIN_LIFE_FRAME_PRIORITY } from '@/depths/scene/constants'
import type { MilestoneProps } from '../shared/milestone'
import RuinGlints from '../shared/RuinGlints'
import RuinHalo from '../shared/RuinHalo'
import { wakeShare, wakeStrength } from '../shared/ruinWake'
import { DIAMOND_GLINTS, PORTAL_HALO } from './constants'
import { buildRingGlow, createRingGlowMaterial } from './portalArchModel'
import { breathePortal, findPortalArch, glowRing, turnSummoningCircle } from './portalGlow'

export default function PortalArch({ ruin, level, timeline, clock }: MilestoneProps) {
  const arch = useMemo(() => findPortalArch(ruin), [ruin])
  const geometry = useMemo(() => buildRingGlow(arch.ringRadius), [arch])
  const material = useMemo(() => createRingGlowMaterial(), [])
  const strength = () => wakeStrength(wakeShare(timeline, level))

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(() => {
    const wake = wakeShare(timeline, level)
    breathePortal(arch, clock.elapsed, wake)
    turnSummoningCircle(arch, clock.elapsed)
    glowRing(material, clock.elapsed, wake)
  }, RUIN_LIFE_FRAME_PRIORITY)

  return (
    <>
      {createPortal(
        <mesh
          geometry={geometry}
          material={material}
          position={arch.ringGlowSpot}
          frustumCulled={false}
          renderOrder={RENDER_LAYER.glow}
        />,
        ruin
      )}
      <RuinHalo ruin={ruin} halos={arch.halos} tuning={PORTAL_HALO} glow={strength} />
      <RuinGlints gem={arch.glintGem} tuning={DIAMOND_GLINTS} clock={clock} glow={strength} />
    </>
  )
}
