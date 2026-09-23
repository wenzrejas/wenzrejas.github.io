import { PHASES } from '../components/World/DayNightCycle/dayNightKeyframes'
import type { MusicTrack } from './sounds'

// ── Mix ───────────────────────────────────────────────────────────────────────
export const MASTER_VOLUME = 1
export const CHANNEL_VOLUMES = {
  music: 0.6,
  ambience: 1,
  sfx: 1,
}

// ── Music ─────────────────────────────────────────────────────────────────────
export const DEFAULT_MUSIC = 'pacificTune' satisfies MusicTrack
export const RAIN_MUSIC = 'rainMelody' satisfies MusicTrack
export const NIGHT_MUSIC = 'nightTune' satisfies MusicTrack
export const NIGHT_MUSIC_FROM = PHASES.dusk
export const NIGHT_MUSIC_UNTIL = PHASES.sunrise
export const ISLAND_MUSIC_RANGE = 150
export const ISLAND_MUSIC_RELEASE = 400
export const WEATHER_MUSIC_CROSSFADE = 4

// ── Fades ─────────────────────────────────────────────────────────────────────
export const DEFAULT_FADE = 1
export const MUSIC_CROSSFADE = 2
export const MUSIC_DUCK = 0.45
export const MUSIC_DUCK_ATTACK = 0.2
export const MUSIC_DUCK_RELEASE = 1.5
export const AMBIENCE_FADE_IN = 3
export const SILENCE_THRESHOLD = 0.002

// ── Weather ───────────────────────────────────────────────────────────────────
export const WEATHER_POLL_MS = 250
export const RAIN_CUTOFF = 0.01
export const RAIN_FADE = 2
export const RAIN_VOLUME_RAMP = 0.5
export const THUNDER_DELAY_MIN = 0.4
export const THUNDER_DELAY_MAX = 2.5
export const THUNDER_VOLUME_MIN = 0.6
export const THUNDER_PITCH_MIN = 0.9
export const THUNDER_PITCH_MAX = 1.1

// ── Wildlife calls ────────────────────────────────────────────────────────────
export const DOLPHIN_FIRST_CALL_MIN = 1
export const DOLPHIN_FIRST_CALL_MAX = 3
export const DOLPHIN_CALL_MIN = 4
export const DOLPHIN_CALL_MAX = 9
export const DOLPHIN_PITCH_MIN = 0.9
export const DOLPHIN_PITCH_MAX = 1.15
export const SEAGULL_CHANCE = 0.4
export const SEAGULL_COOLDOWN = 45
export const SEAGULL_FADE_IN = 1.5
export const SEAGULL_FADE_OUT = 2.5
