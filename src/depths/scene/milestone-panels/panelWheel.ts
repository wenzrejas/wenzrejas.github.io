import type { WheelEvent } from 'react'

export function keepWheelInside(event: WheelEvent<HTMLElement>) {
  const card = event.currentTarget
  const canScroll =
    event.deltaY < 0
      ? card.scrollTop > 0
      : card.scrollTop + card.clientHeight < card.scrollHeight - 1
  if (canScroll) event.stopPropagation()
}
