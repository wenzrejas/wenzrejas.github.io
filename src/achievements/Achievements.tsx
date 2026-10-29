import AchievementToast from './toast/AchievementToast'
import { useAchievementWatch } from './useAchievementWatch'

export default function Achievements() {
  useAchievementWatch()
  return <AchievementToast />
}
