import { isBuoyWithin } from '@/minigames/checkpoint-run/checkpointRun'
import { BUOY_SPOTTED_REACH } from '@/minigames/checkpoint-run/constants'
import { COURSE_KEYS } from '@/minigames/checkpoint-run/courses'
import { isInsideJellyPatch } from '@/minigames/jellyfish-bloom/bloomState'
import { LANTERN_SPOTTED_REACH } from '@/minigames/lantern-night/constants'
import { isLanternFinalePlaying, isLanternWithin } from '@/minigames/lantern-night/lanternFlock'
import {
  bottlesAfloat,
  bottleWithin,
  isBottleAfloat,
  LAST_BOTTLE,
} from '@/minigames/message-in-a-bottle/bottleSpots'
import { BOTTLE_SPOTTED_REACH } from '@/minigames/message-in-a-bottle/constants'
import { useBottleStore } from '@/store/bottleStore'
import { goldCourses, isRaceOnScreen, useCheckpointStore } from '@/store/checkpointStore'
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
  const races = useCheckpointStore.getState()
  const golds = goldCourses(races).length
  const { result } = races
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
    isNearLantern:
      readStage() === 'world' && isLanternWithin(ship.x, ship.z, LANTERN_SPOTTED_REACH),
    isAmongJellyfish: readStage() === 'world' && isInsideJellyPatch(ship.x, ship.z),
    isNearRaceBuoy: readStage() === 'world' && isBuoyWithin(ship.x, ship.z, BUOY_SPOTTED_REACH),
    hasLastBottleWashedUp: isBottleAfloat(LAST_BOTTLE, found) && !isPanelOpen(),
    hasKeptABottle: found.length > 0 && !isPanelOpen(),
    hasFinishedARace: result !== null,
    hasWonGold: result?.medal === 'gold',
    hasWonEveryGold: result !== null && golds === COURSE_KEYS.length,
    isRacing: races.run !== null,
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
    isWorldInView() &&
    !isPanelOpen() &&
    !isCinematicPlaying() &&
    !isRevealPlaying() &&
    !isLanternFinalePlaying() &&
    !isRaceOnScreen(useCheckpointStore.getState())
  return isWorldCalm ? 'world' : 'none'
}
