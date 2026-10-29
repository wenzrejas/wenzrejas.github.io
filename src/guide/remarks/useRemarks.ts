import { useEffect, useRef } from 'react'
import {
  dismissDialogue,
  endDialogue,
  startDialogue,
  useGuideStore,
  useIsIntroductionOver,
} from '@/store/guideStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'
import { rememberedItems, rememberItem } from '@/store/visitorMemory'
import { ONCE_EVER_REMARKS, REMARK_POLL_SECONDS } from './constants'
import { createRemarkWatch, stepRemarks } from './remarkWatch'
import { readStage, readWorld } from './worldReading'

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
