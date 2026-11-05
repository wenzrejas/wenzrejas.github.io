import { rankOf } from '@/achievements/ranks'
import type { RemarkKey } from '@/data/guideCopy'
import { useAchievementStore } from '@/store/achievementStore'
import { dismissDialogue, endDialogue, startDialogue, useGuideStore } from '@/store/guideStore'
import { useViewStore } from '@/store/viewStore'
import { rememberedItems, rememberItem } from '@/store/visitorMemory'
import { nowSeconds, toMilliseconds } from '@/utils/time'
import { PROMOTION_DIALOGUES } from '../constants'
import { ONCE_EVER_REMARKS, REMARK_POLL_SECONDS } from './constants'
import { createRemarkWatch, queuePromotion, stepRemarks } from './remarkWatch'
import { readStage, readWorld } from './worldReading'

export function followRemarks(opening: RemarkKey | null, onOpeningHeard: () => void) {
  const heardBefore = rememberedItems('heardRemarks', ONCE_EVER_REMARKS)
  const watch = createRemarkWatch(nowSeconds(), opening, heardBefore)
  const followWorld = () => {
    const { dialogue } = useGuideStore.getState()
    const step = stepRemarks(watch, readWorld(), nowSeconds(), dialogue, readStage())
    if (step === 'close') endDialogue()
    else if (step === 'dismiss') dismissDialogue()
    else if (step) {
      startDialogue(step)
      if (step === opening) onOpeningHeard()
      if (ONCE_EVER_REMARKS.includes(step)) rememberItem('heardRemarks', step)
    }
  }
  const poll = window.setInterval(followWorld, toMilliseconds(REMARK_POLL_SECONDS))
  const stopFollowingMap = useViewStore.subscribe((view, previous) => {
    if (view.mapPhase !== previous.mapPhase) followWorld()
  })
  const stopFollowingRanks = useAchievementStore.subscribe(({ earned }, previous) => {
    const { rank } = rankOf(earned.length)
    const promotion = PROMOTION_DIALOGUES[rank]
    if (promotion && rank !== rankOf(previous.earned.length).rank) queuePromotion(watch, promotion)
  })
  return () => {
    window.clearInterval(poll)
    stopFollowingMap()
    stopFollowingRanks()
  }
}
