import { create } from 'zustand'
import { IS_DEBUG } from '@/app/experience/constants'
import { DIALOGUES, type DialogueKey } from '@/data/guideCopy'
import { DEPTHS_DIALOGUES, MODAL_DIALOGUES } from '@/guide/constants'
import { MAP_REMARKS } from '@/guide/remarks/constants'
import { isLoaderShowing, useLoadingStore } from './loadingStore'
import { isRemembered, rememberedItems, rememberFlag, rememberItem } from './visitorMemory'

interface GuideState {
  dialogue: DialogueKey | null
  awaitedDialogue: DialogueKey | null
  pageIndex: number
  isOverMap: boolean
  isDismissed: boolean
  isReturningVisitor: boolean
  hasFinishedIntroduction: boolean
  heardDialogues: DialogueKey[]
}

const isReturningVisitor = isRemembered('returningVisitor')

export const useGuideStore = create<GuideState>(() => ({
  dialogue: null,
  awaitedDialogue: null,
  pageIndex: 0,
  isOverMap: false,
  isDismissed: false,
  isReturningVisitor,
  hasFinishedIntroduction: IS_DEBUG || isReturningVisitor,
  heardDialogues: rememberedItems('heardDialogues', DEPTHS_DIALOGUES),
}))

export const startDialogue = (dialogue: DialogueKey) =>
  useGuideStore.setState({
    dialogue,
    awaitedDialogue: null,
    pageIndex: 0,
    isOverMap: MAP_REMARKS.some((remark) => remark === dialogue),
    isDismissed: false,
  })

export const awaitDialogue = (dialogue: DialogueKey) =>
  useGuideStore.setState({ awaitedDialogue: dialogue })

export const stopAwaitingDialogue = (dialogue: DialogueKey) =>
  useGuideStore.setState((state) =>
    state.awaitedDialogue === dialogue ? { awaitedDialogue: null } : state
  )

function closeDialogue(isDismissed: boolean) {
  const { dialogue } = useGuideStore.getState()
  const isOncePerVisitor = dialogue !== null && DEPTHS_DIALOGUES.includes(dialogue)
  if (dialogue === 'introduction') rememberFlag('returningVisitor')
  if (isOncePerVisitor) rememberItem('heardDialogues', dialogue)
  useGuideStore.setState(({ hasFinishedIntroduction, heardDialogues }) => ({
    dialogue: null,
    isDismissed,
    hasFinishedIntroduction: hasFinishedIntroduction || dialogue === 'introduction',
    heardDialogues: isOncePerVisitor ? [...heardDialogues, dialogue] : heardDialogues,
  }))
}

export const endDialogue = () => closeDialogue(false)

export const dismissDialogue = () => closeDialogue(true)

export const hasHeard =
  (dialogue: DialogueKey) =>
  ({ heardDialogues }: GuideState) =>
    heardDialogues.includes(dialogue)

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

export const isTravelHeld = (state: GuideState) =>
  state.awaitedDialogue !== null || isModalDialogue(state)

export const isIntroductionPending = () =>
  isLoaderShowing() || !useGuideStore.getState().hasFinishedIntroduction

export function useIsIntroductionOver() {
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const hasFinishedIntroduction = useGuideStore((state) => state.hasFinishedIntroduction)
  return isLoaderGone && hasFinishedIntroduction
}
