import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { LOADING_COPY } from '@/data/loadingCopy'
import { hasPendingTasks, useLoadingStore } from '@/store/loadingStore'
import { startPreloads } from './preloadTasks'
import './LoadingScreen.scss'

export default function LoadingScreen() {
  const isLoading = useLoadingStore(hasPendingTasks)
  const progress = useProgress((state) => state.progress)
  const [isGone, setGone] = useState(false)

  useEffect(() => startPreloads(), [])

  if (isGone) return null

  return (
    <div
      className={isLoading ? 'loading-screen' : 'loading-screen loading-screen--done'}
      role="status"
      onTransitionEnd={() => setGone(true)}
    >
      {progress < 100 ? `${LOADING_COPY.loading} ${Math.round(progress)}%` : LOADING_COPY.preparing}
    </div>
  )
}
