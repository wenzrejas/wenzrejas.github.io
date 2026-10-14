import { useEffect } from 'react'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { useCycleStore } from '@/store/cycleStore'
import {
  endDialogue,
  startDialogue,
  useGuideStore,
  useIsIntroductionOver,
} from '@/store/guideStore'
import { isPanelOpen } from '@/store/panelStore'
import { isRevealPlaying, useRevealStore } from '@/store/revealStore'
import { useShipStore } from '@/store/shipStore'
import { isMapUnfolded, isWorldInView, isWorldPaused, useViewStore } from '@/store/viewStore'
import { rememberedItems, rememberItem } from '@/store/visitorMemory'
import { isRaining, useWeatherStore } from '@/store/weatherStore'
import { isClearSky } from '@/world/environment/weather/weatherCycle'
import { algaeAt } from '@/world/wildlife/algae/algaeField'
import { ONCE_EVER_REMARKS, REMARK_POLL_SECONDS } from './constants'
import type { RemarkStage, WorldReading } from './remarkMoments'
import { createRemarkWatch, stepRemarks } from './remarkWatch'

function readWorld(): WorldReading {
  const ship = useShipStore.getState()
  const reveal = useRevealStore.getState()
  const view = useViewStore.getState()
  return {
    timeOfDay: useCycleStore.getState().timeOfDay,
    isRaining: isRaining(),
    isClearSky: isClearSky(useWeatherStore.getState().type),
    algaeGlow: algaeAt(ship.x, ship.z),
    tailwind: ship.tailwind,
    revealingIsland: reveal.activeKey,
    nearbyIsland: reveal.nearbyIsland,
    isMapUnfolded: isMapUnfolded(view),
    isWorldPaused: isWorldPaused(view),
    shipSpeed: ship.speed,
    shipHeading: ship.heading,
    shipPlacements: ship.placements,
  }
}

function readStage(): RemarkStage {
  if (useViewStore.getState().mapPhase === 'open') return 'map'
  const isWorldCalm =
    isWorldInView() && !isPanelOpen() && !isCinematicPlaying() && !isRevealPlaying()
  return isWorldCalm ? 'world' : 'none'
}

export function useRemarks() {
  const isIntroductionOver = useIsIntroductionOver()
  const isReturningVisitor = useGuideStore((state) => state.isReturningVisitor)

  useEffect(() => {
    if (!isIntroductionOver) return
    const opening = isReturningVisitor ? 'welcomeBack' : null
    const heardBefore = rememberedItems('heardRemarks', ONCE_EVER_REMARKS)
    const watch = createRemarkWatch(performance.now() / 1000, opening, heardBefore)
    const poll = window.setInterval(() => {
      const { dialogue } = useGuideStore.getState()
      const seconds = performance.now() / 1000
      const step = stepRemarks(watch, readWorld(), seconds, dialogue, readStage())
      if (step === 'close') endDialogue()
      else if (step) {
        startDialogue(step)
        if (ONCE_EVER_REMARKS.includes(step)) rememberItem('heardRemarks', step)
      }
    }, REMARK_POLL_SECONDS * 1000)
    return () => window.clearInterval(poll)
  }, [isIntroductionOver, isReturningVisitor])
}
