import { create } from 'zustand'
import { IS_DEBUG } from '@/app/experience/constants'
import { DIALOGUES, type DialogueKey } from '@/data/guideCopy'
import { MODAL_DIALOGUES } from '@/guide/constants'
import { MAP_REMARKS } from '@/guide/remarks/constants'
import { isLoaderShowing, useLoadingStore } from './loadingStore'
import { isRemembered, rememberFlag } from './visitorMemory'

interface GuideState {
  dialogue: DialogueKey | null
  pageIndex: number
  isOverMap: boolean
  isReturningVisitor: boolean
  hasFinishedIntroduction: boolean
}

const isReturningVisitor = isRemembered('returningVisitor')

export const useGuideStore = create<GuideState>(() => ({
  dialogue: null,
  pageIndex: 0,
  isOverMap: false,
  isReturningVisitor,
  hasFinishedIntroduction: IS_DEBUG || isReturningVisitor,
}))

export const startDialogue = (dialogue: DialogueKey) =>
  useGuideStore.setState({
    dialogue,
    pageIndex: 0,
    isOverMap: MAP_REMARKS.some((remark) => remark === dialogue),
  })

export function endDialogue() {
  const { dialogue } = useGuideStore.getState()
  if (dialogue === 'introduction') rememberFlag('returningVisitor')
  useGuideStore.setState(({ hasFinishedIntroduction }) => ({
    dialogue: null,
    hasFinishedIntroduction: hasFinishedIntroduction || dialogue === 'introduction',
  }))
}

export function showNextPage() {
  const { dialogue, pageIndex } = useGuideStore.getState()
  if (!dialogue) return
  if (pageIndex < DIALOGUES[dialogue].length - 1)
    useGuideStore.setState({ pageIndex: pageIndex + 1 })
  else endDialogue()
}

export function showPreviousPage() {
  const { dialogue, pageIndex } = useGuideStore.getState()
  if (dialogue && pageIndex > 0) useGuideStore.setState({ pageIndex: pageIndex - 1 })
}

export const currentPage = ({ dialogue, pageIndex }: GuideState) =>
  dialogue ? DIALOGUES[dialogue][pageIndex] : null

export const isModalDialogue = ({ dialogue }: GuideState) =>
  dialogue !== null && MODAL_DIALOGUES.includes(dialogue)

export const isIntroductionPending = () =>
  isLoaderShowing() || !useGuideStore.getState().hasFinishedIntroduction

export function useIsIntroductionOver() {
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const hasFinishedIntroduction = useGuideStore((state) => state.hasFinishedIntroduction)
  return isLoaderGone && hasFinishedIntroduction
}
