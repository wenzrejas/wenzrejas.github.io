import type { SpringConfig } from '@react-spring/web'
import { PHASES } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import { PROJECT_KEYS } from '@/world/islands/buildshore/projects/projectSites'
import { ISLAND_KEYS } from '@/world/islands/shared/islandSpecs'
import { STATUE_GROVES } from '@/world/islands/tech-grove/constants'
import type { LiveryKey } from '@/world/ship/constants'

// ── Categories (tab order) ────────────────────────────────────────────────────
export const ACHIEVEMENT_CATEGORIES = [
  'voyage',
  'islands',
  'depths',
  'seaAndSky',
  'oddMoments',
] as const
export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number]

// ── Achievements (tab order; items are counted towards completion) ────────────
interface AchievementSpec {
  category: AchievementCategory
  isSecret?: boolean
  items?: readonly string[]
}

const ACHIEVEMENT_SPECS = {
  anchorsAweigh: { category: 'voyage' },
  landHo: { category: 'voyage' },
  cartographer: { category: 'voyage', items: ISLAND_KEYS },
  windrider: { category: 'voyage' },
  chartedCourse: { category: 'voyage' },
  edgeOfTheWorld: { category: 'voyage', isSecret: true },
  signalSent: { category: 'islands' },
  followingTheLights: { category: 'islands' },
  coffeeBreak: { category: 'islands' },
  groveKeeper: { category: 'islands', items: Object.values(STATUE_GROVES) },
  masterBuilder: { category: 'islands', items: PROJECT_KEYS },
  closerLook: { category: 'islands' },
  intoTheDeep: { category: 'depths' },
  journeysEnd: { category: 'depths' },
  turnBackTime: { category: 'depths' },
  podPals: { category: 'seaAndSky' },
  tharSheBlows: { category: 'seaAndSky', isSecret: true },
  glowingWaters: { category: 'seaAndSky' },
  weatheredTheStorm: { category: 'seaAndSky' },
  stargazer: { category: 'seaAndSky' },
  dawnPatrol: { category: 'seaAndSky' },
  scenicRoute: { category: 'oddMoments', isSecret: true },
  becalmed: { category: 'oddMoments', isSecret: true },
  oldFriend: { category: 'oddMoments' },
  legendOfTheSeas: { category: 'oddMoments' },
} satisfies Record<string, AchievementSpec>

export type AchievementKey = keyof typeof ACHIEVEMENT_SPECS
export const ACHIEVEMENTS: Record<AchievementKey, AchievementSpec> = ACHIEVEMENT_SPECS
export const ACHIEVEMENT_KEYS = Object.keys(ACHIEVEMENT_SPECS) as AchievementKey[]
export const CROWNING_ACHIEVEMENT: AchievementKey = 'legendOfTheSeas'

// ── Ranks (achievements earned to reach each, and the livery it unlocks) ──────
export const RANKS = [
  { rank: 'stowaway', earned: 0, livery: 'original' },
  { rank: 'deckhand', earned: 3, livery: 'seafoam' },
  { rank: 'navigator', earned: 8, livery: 'crimson' },
  { rank: 'firstMate', earned: 13, livery: 'midnight' },
  { rank: 'captain', earned: 19, livery: 'royal' },
  { rank: 'legend', earned: ACHIEVEMENT_KEYS.length, livery: 'gilded' },
] as const satisfies readonly { rank: string; earned: number; livery: LiveryKey }[]
export type RankKey = (typeof RANKS)[number]['rank']

// ── World watch (seconds; times of day as cycle shares) ───────────────────────
export const ACHIEVEMENT_POLL_SECONDS = 0.5
export const EDGE_OF_WORLD_MARGIN = 60
export const DAWN_ENDS_TIME = PHASES.morning
export const NIGHT_ENDS_TIME = PHASES['first light']

// ── Toast ─────────────────────────────────────────────────────────────────────
export const ACHIEVEMENT_BADGE_URL = '/images/achievements/badge.webp'
export const TOAST_SHOW_SECONDS = 4.5
export const TOAST_SLIDE_PIXELS = 16
export const TOAST_SPRING: SpringConfig = { tension: 320, friction: 26 }
export const TOAST_CLOSE_SPRING: SpringConfig = { ...TOAST_SPRING, clamp: true }
