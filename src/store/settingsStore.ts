import { create } from 'zustand'
import type { Channel } from '@/audio/sounds'
import type { PhaseName } from '@/world/environment/day-night-cycle/dayNightKeyframes'
import type { WeatherType } from './weatherStore'
import { rememberedText, rememberText } from './visitorMemory'

export type GraphicsQuality = 'smooth' | 'sharp'
export type ChosenTime = 'auto' | Extract<PhaseName, 'sunrise' | 'noon' | 'sunset' | 'night'>
export type ChosenWeather = 'auto' | Exclude<WeatherType, 'moonlit'>
export type DayLength = 'short' | 'normal' | 'long'
export type WildlifeActivity = 'calm' | 'normal' | 'lively'
export type SailingSpeed = 'leisurely' | 'normal' | 'brisk'

export interface Settings {
  volumes: Record<Channel, number>
  graphicsQuality: GraphicsQuality
  isMotionReduced: boolean
  isFlashingReduced: boolean
  timeOfDay: ChosenTime
  weather: ChosenWeather
  dayLength: DayLength
  wildlife: WildlifeActivity
  sailingSpeed: SailingSpeed
  areRemarksOn: boolean
}

type SettingHolding<Value> = {
  [Key in keyof Settings]: Settings[Key] extends Value ? Key : never
}[keyof Settings]

export type ChoiceSetting = SettingHolding<string>
export type SwitchSetting = SettingHolding<boolean>

const REDUCED_FLASH_STRENGTH = 0.2
const DAY_PACES: Record<DayLength, number> = { short: 2, normal: 1, long: 0.5 }
const WILDLIFE_PACES: Record<WildlifeActivity, number> = { calm: 0.5, normal: 1, lively: 2 }
const SAILING_PACES: Record<SailingSpeed, number> = { leisurely: 0.7, normal: 1, brisk: 1.35 }

const DEFAULT_SETTINGS: Settings = {
  volumes: { music: 1, ambience: 1, sfx: 1 },
  graphicsQuality: 'sharp',
  isMotionReduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isFlashingReduced: false,
  timeOfDay: 'auto',
  weather: 'auto',
  dayLength: 'normal',
  wildlife: 'normal',
  sailingSpeed: 'normal',
  areRemarksOn: true,
}

function recallSettings(): Settings {
  const stored = rememberedText('settings')
  if (!stored) return DEFAULT_SETTINGS
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export const useSettingsStore = create<Settings>(recallSettings)

export function changeSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
  useSettingsStore.setState({ [key]: value } as Pick<Settings, Key>)
  rememberText('settings', JSON.stringify(useSettingsStore.getState()))
}

export const changeVolume = (channel: Channel, volume: number) =>
  changeSetting('volumes', { ...useSettingsStore.getState().volumes, [channel]: volume })

export const isMotionReduced = () => useSettingsStore.getState().isMotionReduced

export const flashStrength = () =>
  useSettingsStore.getState().isFlashingReduced ? REDUCED_FLASH_STRENGTH : 1

export const dayPace = () => DAY_PACES[useSettingsStore.getState().dayLength]

export const wildlifePace = () => WILDLIFE_PACES[useSettingsStore.getState().wildlife]

export const sailingPace = () => SAILING_PACES[useSettingsStore.getState().sailingSpeed]
