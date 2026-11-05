import { COURSES } from '@/minigames/checkpoint-run/courses'
import { LAST_BOTTLE, type BottleKey } from '@/minigames/message-in-a-bottle/bottleSpots'
import { earnAchievement, recordProgress } from '@/store/achievementStore'
import { useBottleStore } from '@/store/bottleStore'
import { goldCourses, useCheckpointStore, type RunResult } from '@/store/checkpointStore'
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

function noteBottles(found: BottleKey[]) {
  earnAchievement('messageInABottle')
  for (const bottle of found) if (bottle !== LAST_BOTTLE) recordProgress('beachcomber', bottle)
}

function noteRaceResult({ course, perfects }: RunResult) {
  earnAchievement('offTheLine')
  if (perfects === COURSES[course].rings.length) earnAchievement('threadTheNeedle')
  const golds = goldCourses(useCheckpointStore.getState())
  if (golds.length > 0) earnAchievement('goldenWake')
  for (const gold of golds) recordProgress('regattaChampion', gold)
}

export function noteReveal(island: IslandKey) {
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
    useBottleStore.subscribe(({ found }, previous) => {
      if (found !== previous.found) noteBottles(found)
    }),
    useCheckpointStore.subscribe(({ result }, previous) => {
      if (result && result !== previous.result) noteRaceResult(result)
    }),
  ]
  return () => {
    for (const stop of stopFollowing) stop()
  }
}
