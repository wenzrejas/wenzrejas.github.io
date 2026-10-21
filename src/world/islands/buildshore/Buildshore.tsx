import { useMemo } from 'react'
import { useDebugStore } from '@/store/debugStore'
import type { IslandBodyProps } from '../shared/types'
import { useIslandModel } from '../shared/islandModel'
import { placeIsland } from '../shared/islandTransform'
import { nightLampLevel } from '../shared/lighting-bake/lightingBakeLevels'
import { useLightingBake } from '../shared/lighting-bake/useLightingBake'
import { useNightGlow } from '../shared/nightGlow'
import Coast from '@/world/shore/Coast'
import { useCoastFields } from '@/world/shore/useCoastFields'
import { useWavingFlags } from './ambient/flag-wave/useWavingFlags'
import { useScreenGlow } from './ambient/screen-glow/useScreenGlow'
import { useStationClock } from './ambient/station-clock/useStationClock'
import {
  BUILDSHORE_MODEL_URL,
  BUILDSHORE_OVERHEAD_SHADOW_STRENGTH,
  BUILDSHORE_SHORELINE_RESOLUTION,
  LAMP_SPILL_STRENGTH,
} from './constants'
import BuildshoreProjects from './projects/BuildshoreProjects'
import { PROJECT_HOVER_GLOW_MATERIALS } from './projects/constants'
import { useProjectHovers } from './projects/useProjectHovers'
import Train from './train/Train'
import { findTrainRig } from './train/trainRig'
import Waterfall from './waterfall/Waterfall'
import { findCascades } from './waterfall/cascades'

export default function Buildshore({ islandKey, config }: IslandBodyProps) {
  const tuning = useDebugStore((s) => s.islands.buildshore)
  const island = useIslandModel(BUILDSHORE_MODEL_URL, tuning.brightness)
  useLightingBake(island, {
    overheadShadowStrength: BUILDSHORE_OVERHEAD_SHADOW_STRENGTH,
    lampLevel: nightLampLevel(LAMP_SPILL_STRENGTH),
  })
  const train = useMemo(() => findTrainRig(island.model), [island])
  const cascades = useMemo(() => findCascades(island.model), [island])
  const ambientGlows = useMemo(
    () => island.glows.filter(({ mat }) => !PROJECT_HOVER_GLOW_MATERIALS.includes(mat.name)),
    [island]
  )
  useNightGlow(ambientGlows)
  useScreenGlow(island)
  useStationClock(island.model)
  useWavingFlags(island.model)
  const hovers = useProjectHovers()

  const placement = placeIsland(config.radius, tuning, island.footprint, island.center)
  const coast = useCoastFields(
    island.model,
    placement.scale,
    tuning.offsetY,
    BUILDSHORE_SHORELINE_RESOLUTION
  )

  return (
    <>
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
        {train && <Train rig={train} hover={hovers.chooChooChain} islandScale={placement.scale} />}
        <BuildshoreProjects
          island={island}
          hovers={hovers}
          collision={coast?.collision ?? null}
          islandScale={placement.scale}
        />
      </group>
      {cascades.flows.length > 0 && (
        <Waterfall cascades={cascades} placement={placement} offsetY={tuning.offsetY} />
      )}
    </>
  )
}
