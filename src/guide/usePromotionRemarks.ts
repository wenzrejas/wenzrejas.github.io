import { useEffect } from 'react'
import { rankOf } from '@/achievements/ranks'
import type { DialogueKey } from '@/data/guideCopy'
import { useAchievementStore } from '@/store/achievementStore'
import {
  dismissDialogue,
  endDialogue,
  startDialogue,
  useGuideStore,
  useIsIntroductionOver,
} from '@/store/guideStore'
import { useSettingsStore } from '@/store/settingsStore'
import { isMapUnfolded, useViewStore } from '@/store/viewStore'
import { PROMOTION_DIALOGUES } from './constants'
import { REMARK_POLL_SECONDS, REMARK_SHOW_SECONDS } from './remarks/constants'
import { readStage } from './remarks/worldReading'

interface PromotionWatch {
  pending: DialogueKey | null
  shown: DialogueKey | null
  shownSince: number
}

function stepPromotion(watch: PromotionWatch, seconds: number) {
  const { dialogue, awaitedDialogue } = useGuideStore.getState()
  const stage = readStage()
  if (watch.shown) {
    if (dialogue !== watch.shown) watch.shown = null
    else if (isMapUnfolded(useViewStore.getState())) dismissDialogue()
    else if (stage !== 'world' || seconds - watch.shownSince >= REMARK_SHOW_SECONDS) endDialogue()
    return
  }
  if (!watch.pending || dialogue || awaitedDialogue || stage !== 'world') return
  startDialogue(watch.pending)
  watch.shown = watch.pending
  watch.shownSince = seconds
  watch.pending = null
}

export function usePromotionRemarks() {
  const isIntroductionOver = useIsIntroductionOver()
  const areRemarksOn = useSettingsStore((state) => state.areRemarksOn)

  useEffect(() => {
    if (!isIntroductionOver || !areRemarksOn) return
    const watch: PromotionWatch = { pending: null, shown: null, shownSince: 0 }
    const stopFollowingRanks = useAchievementStore.subscribe(({ earned }, previous) => {
      const { rank } = rankOf(earned.length)
      if (rank !== rankOf(previous.earned.length).rank)
        watch.pending = PROMOTION_DIALOGUES[rank] ?? null
    })
    const poll = window.setInterval(
      () => stepPromotion(watch, performance.now() / 1000),
      REMARK_POLL_SECONDS * 1000
    )
    return () => {
      stopFollowingRanks()
      window.clearInterval(poll)
      if (watch.shown && useGuideStore.getState().dialogue === watch.shown) endDialogue()
    }
  }, [isIntroductionOver, areRemarksOn])
}
