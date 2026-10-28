import { useEffect, useRef } from 'react'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { useCycleStore } from '@/store/cycleStore'
import {
  dismissDialogue,
  endDialogue,
  startDialogue,
  useGuideStore,
  useIsIntroductionOver,
} from '@/store/guideStore'
import { isPanelOpen } from '@/store/panelStore'
import { isRevealPlaying, useRevealStore } from '@/store/revealStore'
import { useSettingsStore } from '@/store/settingsStore'
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
  const areRemarksOn = useSettingsStore((state) => state.areRemarksOn)
  const hasGreeted = useRef(false)

  useEffect(() => {
    if (!isIntroductionOver || !areRemarksOn) return
    const opening = isReturningVisitor && !hasGreeted.current ? 'welcomeBack' : null
    const heardBefore = rememberedItems('heardRemarks', ONCE_EVER_REMARKS)
    const watch = createRemarkWatch(performance.now() / 1000, opening, heardBefore)
    const followWorld = () => {
      const { dialogue } = useGuideStore.getState()
      const seconds = performance.now() / 1000
      const step = stepRemarks(watch, readWorld(), seconds, dialogue, readStage())
      if (step === 'close') endDialogue()
      else if (step === 'dismiss') dismissDialogue()
      else if (step) {
        startDialogue(step)
        if (step === opening) hasGreeted.current = true
        if (ONCE_EVER_REMARKS.includes(step)) rememberItem('heardRemarks', step)
      }
    }
    const poll = window.setInterval(followWorld, REMARK_POLL_SECONDS * 1000)
    const stopFollowingMap = useViewStore.subscribe((view, previous) => {
      if (view.mapPhase !== previous.mapPhase) followWorld()
    })
    return () => {
      window.clearInterval(poll)
      stopFollowingMap()
    }
  }, [isIntroductionOver, isReturningVisitor, areRemarksOn])
}
