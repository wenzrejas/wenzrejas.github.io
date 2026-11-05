import type { IslandKey } from '@/world/islands/shared/constants'

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

const soundFiles = (folder: 'bgm' | 'sfx', name: string) => ({
  url: `/audio/${folder}/${name}/${name}.webm`,
  fallback: `/audio/${folder}/${name}/${name}.mp3`,
})

export const SOUNDS = {
  oceanWaves: { ...soundFiles('sfx', 'ocean-waves'), channel: 'ambience', volume: 0.25 },
  rain: { ...soundFiles('sfx', 'rain'), channel: 'ambience', volume: 0.35, stream: true },
  dolphin: { ...soundFiles('sfx', 'dolphin'), channel: 'sfx', volume: 0.06 },
  seagulls: { ...soundFiles('sfx', 'seagulls'), channel: 'sfx', volume: 0.95 },
  thunder: { ...soundFiles('sfx', 'thunder'), channel: 'sfx', volume: 0.25 },
  skyBeamCharge: { ...soundFiles('sfx', 'skybeam-charge'), channel: 'sfx', volume: 0.08 },
  skyBeamShoot: { ...soundFiles('sfx', 'skybeam-shoot'), channel: 'sfx', volume: 0.12 },
  paperPanel: {
    ...soundFiles('sfx', 'paper-panel'),
    channel: 'sfx',
    volume: 0.15,
    hasLeadIn: true,
  },
  click: { ...soundFiles('sfx', 'click'), channel: 'sfx', volume: 0.06, hasLeadIn: true },
  dive: { ...soundFiles('sfx', 'dive'), channel: 'sfx', volume: 0.05 },
  ascentBubbles: { ...soundFiles('sfx', 'bubbles'), channel: 'sfx', volume: 0.5 },
  timeRewind: { ...soundFiles('sfx', 'time-rewind'), channel: 'sfx', volume: 0.02 },
  whale: { ...soundFiles('sfx', 'whale'), channel: 'sfx', volume: 0.05 },
  waterfall: { ...soundFiles('sfx', 'waterfall'), channel: 'ambience', volume: 1.4 },
  crickets: { ...soundFiles('sfx', 'crickets'), channel: 'ambience', volume: 0.06 },
  trainEngine: { ...soundFiles('sfx', 'steam-engine'), channel: 'ambience', volume: 0.05 },
  trainWhistle: { ...soundFiles('sfx', 'train-whistle'), channel: 'sfx', volume: 0.03 },
  startWhistle: {
    ...soundFiles('sfx', 'start-whistle'),
    channel: 'sfx',
    volume: 0.03,
    hasLeadIn: true,
  },
  bottleClink: { ...soundFiles('sfx', 'bottle-clink'), channel: 'sfx', volume: 0.05 },
  lanternRustle: { ...soundFiles('sfx', 'lantern-rustle'), channel: 'sfx', volume: 0.2 },
  ringPass: { ...soundFiles('sfx', 'ring-pass'), channel: 'sfx', volume: 0.05, hasLeadIn: true },
  achievementPop: { ...soundFiles('sfx', 'achievement-pop'), channel: 'sfx', volume: 0.05 },
  pacificTune: {
    ...soundFiles('bgm', 'pacific-melody'),
    channel: 'music',
    volume: 0.2,
    stream: true,
  },
  rainMelody: { ...soundFiles('bgm', 'rain-melody'), channel: 'music', volume: 0.2, stream: true },
  nightTune: { ...soundFiles('bgm', 'night-melody'), channel: 'music', volume: 0.2, stream: true },
  cozyIsle: { ...soundFiles('bgm', 'cozy-isle'), channel: 'music', volume: 0.15, stream: true },
  techGrove: { ...soundFiles('bgm', 'tech-grove'), channel: 'music', volume: 0.2, stream: true },
  luminaPoint: {
    ...soundFiles('bgm', 'lumina-point'),
    channel: 'music',
    volume: 0.25,
    stream: true,
  },
  buildshore: { ...soundFiles('bgm', 'buildshore'), channel: 'music', volume: 0.2, stream: true },
  timewell: {
    ...soundFiles('bgm', 'timewell-depth'),
    channel: 'music',
    volume: 0.25,
    stream: true,
  },
  regattaRun: { ...soundFiles('bgm', 'regatta-run'), channel: 'music', volume: 0.2, stream: true },
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
  'Regatta Run': 'regattaRun',
} as const satisfies Record<string, SoundName>

export type MusicTrack = (typeof MUSIC_TRACKS)[keyof typeof MUSIC_TRACKS]

export const ISLAND_TUNES: Partial<Record<IslandKey, MusicTrack>> = {
  cozy: 'cozyIsle',
  tech: 'techGrove',
  lumina: 'luminaPoint',
  buildshore: 'buildshore',
  timewell: 'timewell',
}
