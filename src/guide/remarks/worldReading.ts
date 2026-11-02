import {
  bottlesAfloat,
  bottleWithin,
  isBottleAfloat,
  LAST_BOTTLE,
} from '@/minigames/message-in-a-bottle/bottleSpots'
import { BOTTLE_SPOTTED_REACH } from '@/minigames/message-in-a-bottle/constants'
import { useBottleStore } from '@/store/bottleStore'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { useCycleStore } from '@/store/cycleStore'
import { isPanelOpen } from '@/store/panelStore'
import { isRevealPlaying, useRevealStore } from '@/store/revealStore'
import { useShipStore } from '@/store/shipStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import { isMapUnfolded, isWorldInView, isWorldPaused, useViewStore } from '@/store/viewStore'
import { isRainyWeather } from '@/store/weatherStore'
import { moonSparkleIntensity } from '@/world/environment/weather/sparkleField'
import { algaeAt } from '@/world/wildlife/algae/algaeField'
import type { RemarkStage, WorldReading } from './remarkMoments'

export function readWorld(): WorldReading {
  const ship = useShipStore.getState()
  const reveal = useRevealStore.getState()
  const view = useViewStore.getState()
  const { found } = useBottleStore.getState()
  return {
    timeOfDay: useCycleStore.getState().timeOfDay,
    isRaining: isRainyWeather(),
    moonSparkle: moonSparkleIntensity(),
    algaeGlow: algaeAt(ship.x, ship.z),
    tailwind: ship.tailwind,
    revealingIsland: reveal.activeKey,
    nearbyIsland: reveal.nearbyIsland,
    isMapUnfolded: isMapUnfolded(view),
    isWorldPaused: isWorldPaused(view),
    isSkyBeamActive: useSkyBeamStore.getState().isActive,
    isNearBottle:
      bottleWithin(bottlesAfloat(found), ship.x, ship.z, BOTTLE_SPOTTED_REACH) !== undefined,
    hasLastBottleWashedUp: isBottleAfloat(LAST_BOTTLE, found) && !isPanelOpen(),
    hasKeptABottle: found.length > 0 && !isPanelOpen(),
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
