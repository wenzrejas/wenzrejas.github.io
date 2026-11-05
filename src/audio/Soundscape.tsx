import { useEffect } from 'react'
import { installAudio, listenForClicks, startAmbience, startMusic } from './audioLifecycle'
import { useLoadingStore } from '@/store/loadingStore'
import { isBelowSurface, useViewStore } from '@/store/viewStore'

export default function Soundscape() {
  const hasSetSail = useLoadingStore((state) => state.hasSetSail)
  const isUnderwater = useViewStore(isBelowSurface)

  useEffect(() => installAudio(), [])

  useEffect(() => listenForClicks(), [])

  useEffect(() => {
    if (!hasSetSail) return
    return startMusic()
  }, [hasSetSail])

  useEffect(() => {
    if (!hasSetSail || isUnderwater) return
    return startAmbience()
  }, [hasSetSail, isUnderwater])

  return null
}
