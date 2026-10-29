import type { LiveryKey } from '@/world/ship/constants'
import { RANKS } from './constants'

type RankStep = (typeof RANKS)[number]

export const rankOf = (earnedCount: number) =>
  RANKS.reduce<RankStep>((reached, step) => (earnedCount >= step.earned ? step : reached), RANKS[0])

export const nextRankOf = (earnedCount: number) =>
  RANKS.find((step) => step.earned > earnedCount) ?? null

export const unlockingRankOf = (livery: LiveryKey) =>
  RANKS.find((step) => step.livery === livery) ?? RANKS[0]
