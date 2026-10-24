import { useEffect, useLayoutEffect } from 'react'
import type { DialogueKey } from '@/data/guideCopy'
import { useDepthsStore } from '@/store/depthsStore'
import {
  awaitDialogue,
  endDialogue,
  hasHeard,
  startDialogue,
  stopAwaitingDialogue,
  useGuideStore,
} from '@/store/guideStore'
import { isDepthsInView, isDepthsScene, useViewStore } from '@/store/viewStore'
import {
  ARRIVAL_DIALOGUE_DELAY_SECONDS,
  DEPTHS_DIALOGUES,
  LANDING_DIALOGUE_DELAY_SECONDS,
} from './constants'

function useDialogueAfter(isMomentReached: boolean, dialogue: DialogueKey, delaySeconds: number) {
  useLayoutEffect(() => {
    if (!isMomentReached || hasHeard(dialogue)(useGuideStore.getState())) return
    awaitDialogue(dialogue)
    const pause = window.setTimeout(() => {
      if (isDepthsInView()) startDialogue(dialogue)
      else stopAwaitingDialogue(dialogue)
    }, delaySeconds * 1000)
    return () => {
      window.clearTimeout(pause)
      stopAwaitingDialogue(dialogue)
    }
  }, [isMomentReached, dialogue, delaySeconds])
}

export function useDepthsDialogues() {
  const isInDepths = useViewStore(isDepthsScene)
  const isRevealed = useDepthsStore((state) => state.isRevealed)
  const isShipLanded = useDepthsStore((state) => state.isShipLanded)

  useDialogueAfter(isInDepths && isRevealed, 'arrivedInDepths', ARRIVAL_DIALOGUE_DELAY_SECONDS)
  useDialogueAfter(isInDepths && isShipLanded, 'landedAtTheClock', LANDING_DIALOGUE_DELAY_SECONDS)

  useEffect(() => {
    const { dialogue } = useGuideStore.getState()
    if (!isInDepths && dialogue !== null && DEPTHS_DIALOGUES.includes(dialogue)) endDialogue()
  }, [isInDepths])
}
