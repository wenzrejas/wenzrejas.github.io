import type { IslandKey } from '../world/islands/shared/constants'

export const CHANNELS = ['music', 'ambience', 'sfx'] as const
export type Channel = (typeof CHANNELS)[number]

export interface SoundDefinition {
  url: string
  fallback?: string
  channel: Channel
  volume: number
  stream?: boolean
  hasLeadIn?: boolean
}

export const SOUNDS = {
  oceanWaves: {
    url: '/audio/sfx/ocean-waves.webm',
    fallback: '/audio/sfx/ocean-waves.mp3',
    channel: 'ambience',
    volume: 0.25,
  },
  rain: {
    url: '/audio/sfx/rain.webm',
    fallback: '/audio/sfx/rain.mp3',
    channel: 'ambience',
    volume: 0.35,
    stream: true,
  },
  dolphin: {
    url: '/audio/sfx/dolphin.webm',
    fallback: '/audio/sfx/dolphin.mp3',
    channel: 'sfx',
    volume: 0.08,
  },
  seagulls: {
    url: '/audio/sfx/seagulls.webm',
    fallback: '/audio/sfx/seagulls.mp3',
    channel: 'sfx',
    volume: 0.95,
  },
  thunder: {
    url: '/audio/sfx/thunder.webm',
    fallback: '/audio/sfx/thunder.mp3',
    channel: 'sfx',
    volume: 0.25,
  },
  skyBeamCharge: {
    url: '/audio/sfx/skybeam-charge.webm',
    fallback: '/audio/sfx/skybeam-charge.mp3',
    channel: 'sfx',
    volume: 0.08,
  },
  skyBeamShoot: {
    url: '/audio/sfx/skybeam-shoot.webm',
    fallback: '/audio/sfx/skybeam-shoot.mp3',
    channel: 'sfx',
    volume: 0.12,
  },

  paperPanel: {
    url: '/audio/sfx/paper-panel.webm',
    fallback: '/audio/sfx/paper-panel.mp3',
    channel: 'sfx',
    volume: 0.15,
    hasLeadIn: true,
  },
  dive: {
    url: '/audio/sfx/dive.webm',
    fallback: '/audio/sfx/dive.mp3',
    channel: 'sfx',
    volume: 0.05,
  },
  ascentBubbles: {
    url: '/audio/sfx/bubbles.webm',
    fallback: '/audio/sfx/bubbles.mp3',
    channel: 'sfx',
    volume: 0.5,
  },
  timeRewind: {
    url: '/audio/sfx/time-rewind.webm',
    fallback: '/audio/sfx/time-rewind.mp3',
    channel: 'sfx',
    volume: 0.02,
  },
  whale: {
    url: '/audio/sfx/whale.webm',
    fallback: '/audio/sfx/whale.mp3',
    channel: 'sfx',
    volume: 0.05,
  },
  waterfall: {
    url: '/audio/sfx/waterfall.webm',
    fallback: '/audio/sfx/waterfall.mp3',
    channel: 'ambience',
    volume: 1.4,
  },
  trainEngine: {
    url: '/audio/sfx/steam-engine.webm',
    fallback: '/audio/sfx/steam-engine.mp3',
    channel: 'ambience',
    volume: 0.03,
  },
  trainWhistle: {
    url: '/audio/sfx/train-whistle.webm',
    fallback: '/audio/sfx/train-whistle.mp3',
    channel: 'sfx',
    volume: 0.03,
  },
  pacificTune: {
    url: '/audio/bgm/pacific-melody.webm',
    fallback: '/audio/bgm/pacific-melody.mp3',
    channel: 'music',
    volume: 0.2,
    stream: true,
  },
  rainMelody: {
    url: '/audio/bgm/rain-melody.webm',
    fallback: '/audio/bgm/rain-melody.mp3',
    channel: 'music',
    volume: 0.2,
    stream: true,
  },
  nightTune: {
    url: '/audio/bgm/night-melody.webm',
    fallback: '/audio/bgm/night-melody.mp3',
    channel: 'music',
    volume: 0.2,
    stream: true,
  },
  cozyIsle: {
    url: '/audio/bgm/cozy-isle.webm',
    fallback: '/audio/bgm/cozy-isle.mp3',
    channel: 'music',
    volume: 0.15,
    stream: true,
  },
  techGrove: {
    url: '/audio/bgm/tech-grove.webm',
    fallback: '/audio/bgm/tech-grove.mp3',
    channel: 'music',
    volume: 0.2,
    stream: true,
  },
  luminaPoint: {
    url: '/audio/bgm/lumina-point.webm',
    fallback: '/audio/bgm/lumina-point.mp3',
    channel: 'music',
    volume: 0.25,
    stream: true,
  },
  buildshore: {
    url: '/audio/bgm/buildshore.webm',
    fallback: '/audio/bgm/buildshore.mp3',
    channel: 'music',
    volume: 0.2,
    stream: true,
  },
  timewell: {
    url: '/audio/bgm/timewell-depth.webm',
    fallback: '/audio/bgm/timewell-depth.mp3',
    channel: 'music',
    volume: 0.25,
    stream: true,
  },
} satisfies Record<string, SoundDefinition>

export type SoundName = keyof typeof SOUNDS

export const MUSIC_TRACKS = {
  'Pacific Tune': 'pacificTune',
  'Rain Melody': 'rainMelody',
  'Night Tune': 'nightTune',
  'Cozy Isle': 'cozyIsle',
  'Tech Grove': 'techGrove',
  'Lumina Point': 'luminaPoint',
  Buildshore: 'buildshore',
  'Timewell Depth': 'timewell',
} as const satisfies Record<string, SoundName>

export type MusicTrack = (typeof MUSIC_TRACKS)[keyof typeof MUSIC_TRACKS]

export const ISLAND_TUNES: Partial<Record<IslandKey, MusicTrack>> = {
  cozy: 'cozyIsle',
  tech: 'techGrove',
  lumina: 'luminaPoint',
  buildshore: 'buildshore',
  timewell: 'timewell',
}
