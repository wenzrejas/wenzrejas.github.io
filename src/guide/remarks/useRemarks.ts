import { useEffect, useRef } from 'react'
import { useGuideStore, useIsIntroductionOver } from '@/store/guideStore'
import { useSettingsStore } from '@/store/settingsStore'
import { followRemarks } from './remarkFollower'

export function useRemarks() {
  const isIntroductionOver = useIsIntroductionOver()
  const isReturningVisitor = useGuideStore((state) => state.isReturningVisitor)
  const areRemarksOn = useSettingsStore((state) => state.areRemarksOn)
  const hasGreeted = useRef(false)

  useEffect(() => {
    if (!isIntroductionOver || !areRemarksOn) return
    const opening = isReturningVisitor && !hasGreeted.current ? 'welcomeBack' : null
    return followRemarks(opening, () => {
      hasGreeted.current = true
    })
  }, [isIntroductionOver, isReturningVisitor, areRemarksOn])
}
