import { useEffect } from 'react'
import { readStage, readWorld } from '@/guide/remarks/worldReading'
import { earnAchievement } from '@/store/achievementStore'
import { useGuideStore, useIsIntroductionOver } from '@/store/guideStore'
import { createAchievementWatch, stepAchievementWatch } from './achievementMoments'
import { ACHIEVEMENT_POLL_SECONDS } from './constants'
import { followStoreEvents } from './storeEvents'

export function useAchievementWatch() {
  const isIntroductionOver = useIsIntroductionOver()

  useEffect(followStoreEvents, [])

  useEffect(() => {
    if (!isIntroductionOver) return
    if (useGuideStore.getState().isReturningVisitor) earnAchievement('oldFriend')
    const watch = createAchievementWatch(performance.now() / 1000)
    const followWorld = () => {
      const seconds = performance.now() / 1000
      for (const achievement of stepAchievementWatch(watch, readWorld(), seconds, readStage()))
        earnAchievement(achievement)
    }
    const poll = window.setInterval(followWorld, ACHIEVEMENT_POLL_SECONDS * 1000)
    return () => window.clearInterval(poll)
  }, [isIntroductionOver])
}
