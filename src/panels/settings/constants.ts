import { ACHIEVEMENT_LIVERIES, RANKS } from '@/achievements/constants'
import type { LiveryKey } from '@/world/ship/constants'
import type {
  ChosenTime,
  ChosenWeather,
  DayLength,
  FrameRateLimit,
  GraphicsQuality,
  SailingSpeed,
  WildlifeActivity,
} from '@/store/settingsStore'

// ── Tabs ──────────────────────────────────────────────────────────────────────
export const SETTINGS_TABS = [
  'general',
  'world',
  'controls',
  'achievements',
  'keepsakes',
  'regatta',
  'about',
] as const
export type SettingsTab = (typeof SETTINGS_TABS)[number]
export const TAB_REVEAL: ScrollIntoViewOptions = {
  block: 'nearest',
  inline: 'nearest',
}

// ── Choices ───────────────────────────────────────────────────────────────────
export const SWITCH_CHOICES = ['on', 'off'] as const
export const GRAPHICS_CHOICES: readonly GraphicsQuality[] = ['smooth', 'sharp']
export const FRAME_RATE_CHOICES: readonly FrameRateLimit[] = ['thirty', 'sixty', 'unlimited']
export const TIME_CHOICES: readonly ChosenTime[] = ['auto', 'sunrise', 'noon', 'sunset', 'night']
export const WEATHER_CHOICES: readonly ChosenWeather[] = [
  'auto',
  'sunny',
  'cloudy',
  'rainy',
  'windy',
]
export const DAY_LENGTH_CHOICES: readonly DayLength[] = ['short', 'normal', 'long']
export const WILDLIFE_CHOICES: readonly WildlifeActivity[] = ['calm', 'normal', 'lively']
export const SAILING_CHOICES: readonly SailingSpeed[] = ['leisurely', 'normal', 'brisk']
export const LIVERY_CHOICES: readonly LiveryKey[] = [
  ...RANKS.map((step) => step.livery),
  ...(Object.keys(ACHIEVEMENT_LIVERIES) as LiveryKey[]),
]

// ── Volume ────────────────────────────────────────────────────────────────────
export const VOLUME_STEP = 0.05
