import { audio } from '@/audio/audioManager'
import { isSailingHeld } from '@/controls/sailingInput'
import { findBottle } from '@/store/bottleStore'
import { isRevealPlaying } from '@/store/revealStore'
import { useShipStore } from '@/store/shipStore'
import { bottleWithin, type BottleKey } from './bottleSpots'
import { BOTTLE_REACH } from './constants'

export function collectReachedBottle(afloat: readonly BottleKey[]) {
  if (isSailingHeld() || isRevealPlaying()) return
  const { x, z } = useShipStore.getState()
  const reached = bottleWithin(afloat, x, z, BOTTLE_REACH)
  if (!reached) return
  audio.play('bottleClink')
  findBottle(reached)
}
