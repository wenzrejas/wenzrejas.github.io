import { earnAchievement, recordProgress } from '@/store/achievementStore'
import { useDepthsStore } from '@/store/depthsStore'
import { usePanelStore, type PanelKey } from '@/store/panelStore'
import { useRevealStore } from '@/store/revealStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import { isDepthsScene, useViewStore } from '@/store/viewStore'
import type { IslandKey } from '@/world/islands/shared/constants'
import { ACHIEVEMENTS, type AchievementKey } from './constants'

const PANEL_COLLECTIONS: AchievementKey[] = ['groveKeeper', 'masterBuilder']

function notePanel(panel: PanelKey) {
  if (panel === 'support') earnAchievement('coffeeBreak')
  for (const achievement of PANEL_COLLECTIONS)
    if (ACHIEVEMENTS[achievement].items?.includes(panel)) recordProgress(achievement, panel)
}

function noteReveal(island: IslandKey) {
  earnAchievement('landHo')
  recordProgress('cartographer', island)
}

export function followStoreEvents() {
  const stopFollowing = [
    usePanelStore.subscribe(({ activePanel }, previous) => {
      if (activePanel && activePanel !== previous.activePanel) notePanel(activePanel)
    }),
    useRevealStore.subscribe(({ activeKey }, previous) => {
      if (activeKey && activeKey !== previous.activeKey) noteReveal(activeKey)
    }),
    useSkyBeamStore.subscribe(({ isActive }) => {
      if (isActive) earnAchievement('signalSent')
    }),
    useViewStore.subscribe((view) => {
      if (isDepthsScene(view)) earnAchievement('intoTheDeep')
    }),
    useDepthsStore.subscribe(({ isShipLanded, surfacingStyle }) => {
      if (isShipLanded) earnAchievement('journeysEnd')
      if (surfacingStyle === 'rewind') earnAchievement('turnBackTime')
    }),
  ]
  return () => {
    for (const stop of stopFollowing) stop()
  }
}
