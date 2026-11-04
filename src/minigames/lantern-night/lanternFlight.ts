import { LANTERN_LIFT_DELAY, LANTERN_RISE_EASE_SECONDS, LANTERN_RISE_SPEED } from './constants'
import type { Lantern } from './lanternFlock'

export const RISE_LAG_HEIGHT = LANTERN_RISE_SPEED * (LANTERN_LIFT_DELAY + LANTERN_RISE_EASE_SECONDS)

export function heightOf({ litSeconds }: Lantern): number {
  if (litSeconds === null) return 0
  const seconds = Math.max(0, litSeconds - LANTERN_LIFT_DELAY)
  const easedAway = LANTERN_RISE_EASE_SECONDS * (1 - Math.exp(-seconds / LANTERN_RISE_EASE_SECONDS))
  return LANTERN_RISE_SPEED * (seconds - easedAway)
}
