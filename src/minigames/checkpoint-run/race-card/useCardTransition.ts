import { useTransition } from '@react-spring/web'
import { CARD_CLOSE_SPRING, CARD_SLIDE_PIXELS, CARD_SPRING } from './constants'

const HIDDEN_CARD = { opacity: 0, y: -CARD_SLIDE_PIXELS }
const SHOWN_CARD = { opacity: 1, y: 0 }
const CLOSING_CARD = { ...HIDDEN_CARD, config: CARD_CLOSE_SPRING }

export function useCardTransition<Item>(item: Item | null) {
  return useTransition(item === null ? [] : [item], {
    from: HIDDEN_CARD,
    enter: SHOWN_CARD,
    leave: CLOSING_CARD,
    config: CARD_SPRING,
    exitBeforeEnter: true,
  })
}
