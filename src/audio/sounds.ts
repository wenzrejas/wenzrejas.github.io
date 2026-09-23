import type { IslandKey } from '../components/World/Islands/constants'

export type Channel = 'music' | 'ambience' | 'sfx'

export interface SoundDefinition {
  url: string
  fallback?: string
  channel: Channel
  volume: number
  stream?: boolean
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
  pacificTune: {
    url: '/audio/bgm/pacific-tune.webm',
    fallback: '/audio/bgm/pacific-tune.mp3',
    channel: 'music',
    volume: 0.2,
    stream: true,
  },
  rainMelody: {
    url: '/audio/bgm/rain-melody.webm',
    fallback: '/audio/bgm/rain-melody.mp3',
    channel: 'music',
    volume: 0.18,
    stream: true,
  },
  nightTune: {
    url: '/audio/bgm/night-tune.webm',
    fallback: '/audio/bgm/night-tune.mp3',
    channel: 'music',
    volume: 0.4,
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
    volume: 0.25,
    stream: true,
  },
  luminaPoint: {
    url: '/audio/bgm/lumina-point.webm',
    fallback: '/audio/bgm/lumina-point.mp3',
    channel: 'music',
    volume: 0.45,
    stream: true,
  },
  buildshore: {
    url: '/audio/bgm/buildshore.webm',
    fallback: '/audio/bgm/buildshore.mp3',
    channel: 'music',
    volume: 0.13,
    stream: true,
  },
  timewell: {
    url: '/audio/bgm/timewell-depth.webm',
    fallback: '/audio/bgm/timewell-depth.mp3',
    channel: 'music',
    volume: 0.4,
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
