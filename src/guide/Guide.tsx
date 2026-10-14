import { useEffect } from 'react'
import { startDialogue, useGuideStore } from '@/store/guideStore'
import { useLoadingStore } from '@/store/loadingStore'
import { isMapOut, useViewStore } from '@/store/viewStore'
import { INTRODUCTION_DELAY_SECONDS } from './constants'
import DialogueBox from './dialogue-box/DialogueBox'
import Mascot from './mascot/Mascot'
import { useRemarks } from './remarks/useRemarks'
import './Guide.scss'

export default function Guide() {
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const hasFinishedIntroduction = useGuideStore((state) => state.hasFinishedIntroduction)
  const isGuideLeft = useViewStore(isMapOut)

  useRemarks()

  useEffect(() => {
    if (!isLoaderGone || hasFinishedIntroduction) return
    const greeting = window.setTimeout(
      () => startDialogue('introduction'),
      INTRODUCTION_DELAY_SECONDS * 1000
    )
    return () => window.clearTimeout(greeting)
  }, [isLoaderGone, hasFinishedIntroduction])

  return (
    <div className={isGuideLeft ? 'guide guide--left' : 'guide'}>
      <DialogueBox isTailLeft={isGuideLeft} />
      <Mascot isMirrored={isGuideLeft} />
    </div>
  )
}
