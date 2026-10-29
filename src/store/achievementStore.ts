import { create } from 'zustand'
import {
  ACHIEVEMENT_KEYS,
  ACHIEVEMENTS,
  CROWNING_ACHIEVEMENT,
  type AchievementKey,
} from '@/achievements/constants'
import { ISLAND_KEYS } from '@/world/islands/shared/islandSpecs'
import type { LiveryKey } from '@/world/ship/constants'
import { rememberedItems, rememberedText, rememberText } from './visitorMemory'

interface AchievementRecord {
  earned: AchievementKey[]
  progress: Partial<Record<AchievementKey, string[]>>
  livery: LiveryKey
}

interface AchievementState extends AchievementRecord {
  announcements: AchievementKey[]
}

const FRESH_RECORD: AchievementRecord = { earned: [], progress: {}, livery: 'original' }

const isComplete = (achievement: AchievementKey, items: string[]) =>
  ACHIEVEMENTS[achievement].items?.every((item) => items.includes(item)) ?? false

function readRecord(): AchievementRecord {
  const stored = rememberedText('achievements')
  if (!stored) return FRESH_RECORD
  try {
    return { ...FRESH_RECORD, ...JSON.parse(stored) }
  } catch {
    return FRESH_RECORD
  }
}

function recallRecord(): AchievementRecord {
  const record = readRecord()
  const revealed = rememberedItems('revealedIslands', ISLAND_KEYS)
  const charted = [...new Set([...(record.progress.cartographer ?? []), ...revealed])]
  const earned = new Set(record.earned)
  if (charted.length > 0) earned.add('landHo')
  if (isComplete('cartographer', charted)) earned.add('cartographer')
  return { ...record, earned: [...earned], progress: { ...record.progress, cartographer: charted } }
}

export const useAchievementStore = create<AchievementState>(() => ({
  ...recallRecord(),
  announcements: [],
}))

function rememberRecord() {
  const { earned, progress, livery } = useAchievementStore.getState()
  rememberText('achievements', JSON.stringify({ earned, progress, livery }))
}

const hasEarnedAllOthers = (earned: AchievementKey[]) =>
  ACHIEVEMENT_KEYS.every((key) => key === CROWNING_ACHIEVEMENT || earned.includes(key))

export function earnAchievement(achievement: AchievementKey) {
  const { earned, announcements } = useAchievementStore.getState()
  if (earned.includes(achievement)) return
  useAchievementStore.setState({
    earned: [...earned, achievement],
    announcements: [...announcements, achievement],
  })
  rememberRecord()
  if (hasEarnedAllOthers(useAchievementStore.getState().earned))
    earnAchievement(CROWNING_ACHIEVEMENT)
}

export function recordProgress(achievement: AchievementKey, item: string) {
  const { progress } = useAchievementStore.getState()
  const recorded = progress[achievement] ?? []
  if (recorded.includes(item)) return
  const items = [...recorded, item]
  useAchievementStore.setState({ progress: { ...progress, [achievement]: items } })
  rememberRecord()
  if (isComplete(achievement, items)) earnAchievement(achievement)
}

export function chooseLivery(livery: LiveryKey) {
  useAchievementStore.setState({ livery })
  rememberRecord()
}

export const finishAnnouncement = () =>
  useAchievementStore.setState(({ announcements }) => ({ announcements: announcements.slice(1) }))
