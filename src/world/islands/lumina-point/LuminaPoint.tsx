import { useMemo } from 'react'
import { createPortal, useThree } from '@react-three/fiber'
import { useDebugStore } from '@/store/debugStore'
import type { IslandBodyProps } from '../shared/types'
import IslandFrame from '../shared/IslandFrame'
import { useIslandModel } from '../shared/islandModel'
import { placeIsland } from '../shared/islandTransform'
import { nightLampLevel } from '../shared/lighting-bake/lightingBakeLevels'
import { useLightingBake } from '../shared/lighting-bake/useLightingBake'
import { useNightGlow } from '../shared/nightGlow'
import { useCoastFields } from '@/world/shore/useCoastFields'
import RockSurf from '../shared/rock-surf/RockSurf'
import {
  LAMP_SPILL_STRENGTH,
  LUMINA_BLOB,
  LUMINA_MODEL_URL,
  LUMINA_OVERHEAD_SHADOW_STRENGTH,
  LUMINA_SURF,
  MAIN_ISLAND_TERRAIN_NODES,
} from './constants'
import { rigBeam } from './lighthouseBeam'
import Holograms from './Holograms'
import LuminaBeam from './LuminaBeam'
import MainIslandInteraction from './MainIslandInteraction'
import MonolithLinks from './MonolithLinks'
import SeabedCircuit from './SeabedCircuit'
import SkyBeam from './SkyBeam'
import { splitLighthouseGlows, tintLights, useLighthouseGlow } from './lights'
import { findMainIsland } from './mainIsland'
import { findMonoliths } from './monoliths'
import { findSkyBeamAnchor } from './skyBeamSequence'
import { useLogoFloat } from './useLogoFloat'

export default function LuminaPoint({ islandKey, config }: IslandBodyProps) {
  const root = useThree((state) => state.scene)
  const tuning = useDebugStore((state) => state.islands.lumina)
  const island = useIslandModel(LUMINA_MODEL_URL, tuning.brightness)
  useLightingBake(island, {
    overheadShadowStrength: LUMINA_OVERHEAD_SHADOW_STRENGTH,
    lampLevel: nightLampLevel(LAMP_SPILL_STRENGTH),
  })
  const { beam, skyBeam, monoliths, mainIsland, glows } = useMemo(() => {
    tintLights(island)
    return {
      beam: rigBeam(island.model),
      skyBeam: findSkyBeamAnchor(island.model),
      monoliths: findMonoliths(island.model),
      mainIsland: findMainIsland(island.model),
      glows: splitLighthouseGlows(island),
    }
  }, [island])

  useNightGlow(glows.ambient)
  useLighthouseGlow(glows.lighthouse)
  useLogoFloat(monoliths)

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(island.model, placement.scale, tuning.offsetY)

  return (
    <>
      <IslandFrame
        islandKey={islandKey}
        radius={config.radius}
        tuning={tuning}
        island={island}
        placement={placement}
        coast={coast}
        blob={LUMINA_BLOB}
      >
        <Holograms monoliths={monoliths} islandScale={placement.scale} />
        <MonolithLinks monoliths={monoliths} />
        {mainIsland && (
          <MainIslandInteraction mainIsland={mainIsland} islandScale={placement.scale} />
        )}
        {coast && mainIsland && (
          <SeabedCircuit
            model={island.model}
            shoreline={coast.shoreline}
            mainIsland={mainIsland}
            monoliths={monoliths}
            islandScale={placement.scale}
            offsetY={tuning.offsetY}
          />
        )}
      </IslandFrame>
      {coast && (
        <RockSurf
          model={island.model}
          terrainNodes={MAIN_ISLAND_TERRAIN_NODES}
          shoreline={coast.shoreline}
          placement={placement}
          offsetY={tuning.offsetY}
          config={config}
          tuning={LUMINA_SURF}
        />
      )}
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
