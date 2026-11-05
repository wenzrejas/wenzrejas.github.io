import type { RankKey } from '@/achievements/constants'
import type { DialogueKey, PromotionKey } from '@/data/guideCopy'

// ── Introduction ──────────────────────────────────────────────────────────────
export const INTRODUCTION_DELAY_SECONDS = 0.6

// ── Depths dialogues ──────────────────────────────────────────────────────────
export const DEPTHS_DIALOGUES: DialogueKey[] = ['arrivedInDepths', 'landedAtTheClock']
export const ARRIVAL_DIALOGUE_DELAY_SECONDS = 0.6
export const LANDING_DIALOGUE_DELAY_SECONDS = 1.2

// ── Promotions ────────────────────────────────────────────────────────────────
export const PROMOTION_DIALOGUES: Partial<Record<RankKey, PromotionKey>> = {
  deckhand: 'promotedToDeckhand',
  navigator: 'promotedToNavigator',
  firstMate: 'promotedToFirstMate',
  captain: 'promotedToCaptain',
  legend: 'promotedToLegend',
}

// ── Modal dialogues ───────────────────────────────────────────────────────────
export const MODAL_DIALOGUES: DialogueKey[] = [...DEPTHS_DIALOGUES]
