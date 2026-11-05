import { useEffect } from 'react'
import { startDialogue, useGuideStore } from '@/store/guideStore'
import { useLoadingStore } from '@/store/loadingStore'
import { useIsPanelCoveringScreen } from '@/store/panelStore'
import { toMilliseconds } from '@/utils/time'
import { INTRODUCTION_DELAY_SECONDS } from './constants'
import DialogueBox from './dialogue-box/DialogueBox'
import Mascot from './mascot/Mascot'
import { useRemarks } from './remarks/useRemarks'
import { useDepthsDialogues } from './useDepthsDialogues'
import './Guide.scss'

export default function Guide() {
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const hasFinishedIntroduction = useGuideStore((state) => state.hasFinishedIntroduction)
  const isGuideLeft = useGuideStore((state) => state.isOverMap)
  const isPanelCovering = useIsPanelCoveringScreen()
  const className = ['guide', isGuideLeft && 'guide--left', isPanelCovering && 'guide--hidden']
    .filter(Boolean)
    .join(' ')

  useRemarks()
  useDepthsDialogues()

  useEffect(() => {
    if (!isLoaderGone || hasFinishedIntroduction) return
    const greeting = window.setTimeout(
      () => startDialogue('introduction'),
      toMilliseconds(INTRODUCTION_DELAY_SECONDS)
    )
    return () => window.clearTimeout(greeting)
  }, [isLoaderGone, hasFinishedIntroduction])

  return (
    <div className={className}>
      <DialogueBox isTailLeft={isGuideLeft} />
      <Mascot isMirrored={isGuideLeft} />
    </div>
  )
}
