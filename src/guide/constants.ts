import type { RankKey } from '@/achievements/constants'
import type { DialogueKey } from '@/data/guideCopy'

// ── Introduction (after the loader leaves) ────────────────────────────────────
export const INTRODUCTION_DELAY_SECONDS = 0.6

// ── Depths dialogues (once per visitor, seconds after their moment) ───────────
export const DEPTHS_DIALOGUES: DialogueKey[] = ['arrivedInDepths', 'landedAtTheClock']
export const ARRIVAL_DIALOGUE_DELAY_SECONDS = 0.6
export const LANDING_DIALOGUE_DELAY_SECONDS = 1.2

// ── Promotions (spoken once the world is calm after a new rank) ───────────────
export const PROMOTION_DIALOGUES: Partial<Record<RankKey, DialogueKey>> = {
  deckhand: 'promotedToDeckhand',
  navigator: 'promotedToNavigator',
  firstMate: 'promotedToFirstMate',
  captain: 'promotedToCaptain',
  legend: 'promotedToLegend',
}

// ── Modal dialogues (wait for Next or Skip, lock the screen behind) ───────────
export const MODAL_DIALOGUES: DialogueKey[] = ['openedWorldMap', ...DEPTHS_DIALOGUES]
