import { useEffect } from 'react'
import { useAchievementStore } from '@/store/achievementStore'
import { paintLivery } from './liveryModel'

export function useShipLivery() {
  const livery = useAchievementStore((state) => state.livery)
  useEffect(() => paintLivery(livery), [livery])
}
