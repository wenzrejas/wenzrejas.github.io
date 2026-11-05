import { useEffect } from 'react'
import { readStage, readWorld } from '@/guide/remarks/worldReading'
import { earnAchievement } from '@/store/achievementStore'
import { useGuideStore, useIsIntroductionOver } from '@/store/guideStore'
import { nowSeconds, toMilliseconds } from '@/utils/time'
import { createAchievementWatch, stepAchievementWatch } from './achievementMoments'
import { ACHIEVEMENT_POLL_SECONDS } from './constants'
import { followStoreEvents } from './storeEvents'

export function useAchievementWatch() {
  const isIntroductionOver = useIsIntroductionOver()

  useEffect(followStoreEvents, [])

  useEffect(() => {
    if (!isIntroductionOver) return
    if (useGuideStore.getState().isReturningVisitor) earnAchievement('oldFriend')
    const watch = createAchievementWatch(nowSeconds())
    const followWorld = () => {
      const seconds = nowSeconds()
      for (const achievement of stepAchievementWatch(watch, readWorld(), seconds, readStage()))
        earnAchievement(achievement)
    }
    const poll = window.setInterval(followWorld, toMilliseconds(ACHIEVEMENT_POLL_SECONDS))
    return () => window.clearInterval(poll)
  }, [isIntroductionOver])
}
