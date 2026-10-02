import { useMemo } from 'react'
import { createPortal, useThree } from '@react-three/fiber'
import { useDebugStore } from '@/store/debugStore'
import type { IslandBodyProps } from '../shared/types'
import { useIslandModel } from '../shared/islandModel'
import { placeIsland } from '../shared/islandTransform'
import { useNightGlow } from '../shared/nightGlow'
import IslandShadow from '../shared/IslandShadow'
import Coast from '@/world/shore/Coast'
import { useCoastFields } from '@/world/shore/useCoastFields'
import { LUMINA_BLOB, LUMINA_MODEL_URL } from './constants'
import { rigBeam } from './lighthouseBeam'
import Holograms from './Holograms'
import LuminaBeam from './LuminaBeam'
import MainIslandInteraction from './MainIslandInteraction'
import MonolithLinks from './MonolithLinks'
import SkyBeam from './SkyBeam'
import { tintLights } from './lights'
import { findMainIsland } from './mainIsland'
import { findMonoliths } from './monoliths'
import { findSkyBeamAnchor } from './skyBeamSequence'
import { useLogoFloat } from './useLogoFloat'

export default function LuminaPoint({ islandKey, config }: IslandBodyProps) {
  const root = useThree((s) => s.scene)
  const tuning = useDebugStore((s) => s.islands.lumina)
  const island = useIslandModel(LUMINA_MODEL_URL, tuning.brightness)
  const { beam, skyBeam, monoliths, mainIsland } = useMemo(() => {
    tintLights(island)
    return {
      beam: rigBeam(island.model),
      skyBeam: findSkyBeamAnchor(island.model),
      monoliths: findMonoliths(island.model),
      mainIsland: findMainIsland(island.model),
    }
  }, [island])

  useNightGlow(island.glows)
  useLogoFloat(monoliths)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(island.model, placement.scale, tuning.offsetY)

  return (
    <>
      <IslandShadow radius={config.radius} tuning={tuning} blob={LUMINA_BLOB} />
      <group {...placement}>
        <primitive object={island.model} />
        {coast && (
          <Coast
            islandKey={islandKey}
            fields={coast}
            islandScale={placement.scale}
            offsetY={tuning.offsetY}
          />
        )}
        <Holograms monoliths={monoliths} islandScale={placement.scale} />
        <MonolithLinks monoliths={monoliths} />
        {mainIsland && (
          <MainIslandInteraction mainIsland={mainIsland} islandScale={placement.scale} />
        )}
      </group>
      {(beam || skyBeam) &&
        createPortal(
          <group position={[config.position[0], 0, config.position[2]]}>
            <group {...placement}>
              {beam && <LuminaBeam {...beam} />}
              {skyBeam && <SkyBeam {...skyBeam} islandScale={placement.scale} />}
            </group>
          </group>,
          root
        )}
    </>
  )
}
