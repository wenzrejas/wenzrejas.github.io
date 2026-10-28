import type {
  ChosenTime,
  ChosenWeather,
  DayLength,
  GraphicsQuality,
  SailingSpeed,
  WildlifeActivity,
} from '@/store/settingsStore'

// ── Tabs ──────────────────────────────────────────────────────────────────────
export const SETTINGS_TABS = [
  'sound',
  'display',
  'world',
  'controls',
  'achievements',
  'about',
] as const
export type SettingsTab = (typeof SETTINGS_TABS)[number]

// ── Choices ───────────────────────────────────────────────────────────────────
export const SWITCH_CHOICES = ['on', 'off'] as const
export const GRAPHICS_CHOICES: readonly GraphicsQuality[] = ['smooth', 'sharp']
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

// ── Volume ────────────────────────────────────────────────────────────────────
export const VOLUME_STEP = 0.05
