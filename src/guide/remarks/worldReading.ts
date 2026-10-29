import { isCinematicPlaying } from '@/store/cinematicStore'
import { useCycleStore } from '@/store/cycleStore'
import { isPanelOpen } from '@/store/panelStore'
import { isRevealPlaying, useRevealStore } from '@/store/revealStore'
import { useShipStore } from '@/store/shipStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import { isMapUnfolded, isWorldInView, isWorldPaused, useViewStore } from '@/store/viewStore'
import { isRainyWeather, useWeatherStore } from '@/store/weatherStore'
import { isClearSky } from '@/world/environment/weather/weatherCycle'
import { algaeAt } from '@/world/wildlife/algae/algaeField'
import type { RemarkStage, WorldReading } from './remarkMoments'

export function readWorld(): WorldReading {
  const ship = useShipStore.getState()
  const reveal = useRevealStore.getState()
  const view = useViewStore.getState()
  return {
    timeOfDay: useCycleStore.getState().timeOfDay,
    isRaining: isRainyWeather(),
    isClearSky: isClearSky(useWeatherStore.getState().type),
    algaeGlow: algaeAt(ship.x, ship.z),
    tailwind: ship.tailwind,
    revealingIsland: reveal.activeKey,
    nearbyIsland: reveal.nearbyIsland,
    isMapUnfolded: isMapUnfolded(view),
    isWorldPaused: isWorldPaused(view),
    isSkyBeamActive: useSkyBeamStore.getState().isActive,
    shipX: ship.x,
    shipZ: ship.z,
    shipSpeed: ship.speed,
    shipHeading: ship.heading,
    shipPlacements: ship.placements,
  }
}

export function readStage(): RemarkStage {
  if (useViewStore.getState().mapPhase === 'open') return 'map'
  const isWorldCalm =
    isWorldInView() && !isPanelOpen() && !isCinematicPlaying() && !isRevealPlaying()
  return isWorldCalm ? 'world' : 'none'
}
