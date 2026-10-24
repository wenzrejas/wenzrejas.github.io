import { useId } from 'react'
import { animated, useTransition } from '@react-spring/web'
import { DIALOGUES, GUIDE_COPY } from '@/data/guideCopy'
import { endDialogue, showNextPage, showPreviousPage, useGuideStore } from '@/store/guideStore'
import { MODAL_DIALOGUES } from '../constants'
import { animationSeconds } from '../mascot/mascotPlayback'
import { BOX_CLOSE_SPRING, BOX_SPRING, HIDDEN_BOX_SCALE } from './constants'
import DialogueLine from './DialogueLine'
import DialoguePaper from './DialoguePaper'
import './DialogueBox.scss'

const HIDDEN_BOX = { opacity: 0, scale: HIDDEN_BOX_SCALE }
const SHOWN_BOX = { opacity: 1, scale: 1, delay: animationSeconds('appear') * 1000 }
const CLOSING_BOX = { ...HIDDEN_BOX, config: BOX_CLOSE_SPRING }

const visibilityAt = (opacity: number) => (opacity > 0 ? 'visible' : 'hidden')

const openBoxKey = () => 'open'

export default function DialogueBox({ isTailLeft }: { isTailLeft: boolean }) {
  const dialogue = useGuideStore((state) => state.dialogue)
  const pageIndex = useGuideStore((state) => state.pageIndex)
  const isDismissed = useGuideStore((state) => state.isDismissed)
  const nameId = useId()
  const transitions = useTransition(dialogue ? [dialogue] : [], {
    keys: openBoxKey,
    from: HIDDEN_BOX,
    enter: SHOWN_BOX,
    leave: CLOSING_BOX,
    config: BOX_SPRING,
    immediate: isDismissed,
  })

  if (isDismissed) return null

  return transitions((motion, shownDialogue) => {
    const pages = DIALOGUES[shownDialogue]
    const page = pages[pageIndex]
    const isPaged = pages.length > 1
    const hasButtons = isPaged || MODAL_DIALOGUES.includes(shownDialogue)
    const className = [
      'dialogue-box',
      hasButtons && 'dialogue-box--interactive',
      isTailLeft && 'dialogue-box--tail-left',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <animated.section
        className={className}
        style={{ ...motion, visibility: motion.opacity.to(visibilityAt) }}
        aria-labelledby={nameId}
      >
        <DialoguePaper isTailLeft={isTailLeft} />
        <span id={nameId} className="dialogue-box__name">
          {GUIDE_COPY.name}
        </span>
        <div className="dialogue-box__copy" aria-live="polite">
          <div key={`${shownDialogue}-${pageIndex}`} className="dialogue-box__page">
            {page.heading && <h2 className="dialogue-box__heading">{page.heading}</h2>}
            {page.lines.map((line) => (
              <DialogueLine key={line} line={line} />
            ))}
          </div>
        </div>
        {hasButtons && (
          <nav className="dialogue-box__navigation" aria-label={GUIDE_COPY.pages}>
            <button
              type="button"
              className="dialogue-box__turn dialogue-box__turn--skip"
              onClick={endDialogue}
            >
              {GUIDE_COPY.skip}
            </button>
            {isPaged && (
              <button
                type="button"
                className="dialogue-box__turn"
                disabled={pageIndex === 0}
                onClick={showPreviousPage}
              >
                {GUIDE_COPY.back}
              </button>
            )}
            <button type="button" className="dialogue-box__turn" onClick={showNextPage}>
              {GUIDE_COPY.next}
            </button>
          </nav>
        )}
      </animated.section>
    )
  })
}
