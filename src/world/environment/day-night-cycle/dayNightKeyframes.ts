import * as THREE from 'three'

type Position = [number, number, number]

interface RawKeyframe {
  time: number
  background: string
  fog: string
  hemisphereSky: string
  hemisphereGround: string
  hemisphereIntensity: number
  sunColor: string
  sunIntensity: number
  sunPosition: Position
  moonColor: string
  moonIntensity: number
  moonPosition: Position
  oceanDeep: string
  oceanMid: string
  foam: string
  sparkle: string
  fresnel: number
  specular: number
}

interface Keyframe {
  time: number
  background: THREE.Color
  fog: THREE.Color
  hemisphereSky: THREE.Color
  hemisphereGround: THREE.Color
  hemisphereIntensity: number
  sunColor: THREE.Color
  sunIntensity: number
  sunPosition: Position
  moonColor: THREE.Color
  moonIntensity: number
  moonPosition: Position
  oceanDeep: THREE.Color
  oceanMid: THREE.Color
  foam: THREE.Color
  sparkle: THREE.Color
  fresnel: number
  specular: number
}

export interface KeyframeSample {
  from: Keyframe
  to: Keyframe
  blend: number
}

const PRE_DAWN: RawKeyframe = {
  time: 0.0,
  background: '#0a0620',
  fog: '#080515',
  hemisphereSky: '#120830',
  hemisphereGround: '#080415',
  hemisphereIntensity: 0.1,
  sunColor: '#000000',
  sunIntensity: 0.0,
  sunPosition: [30, -15, 20],
  moonColor: '#8899cc',
  moonIntensity: 1.1,
  moonPosition: [5, 80, 5],
  oceanDeep: '#030710',
  oceanMid: '#060c1a',
  foam: '#7c88bc',
  sparkle: '#d8dcff',
  fresnel: 0.3,
  specular: 0.12,
}

const RAW_KEYFRAMES: RawKeyframe[] = [
  PRE_DAWN,
  // ── First light ─────────────────────────────────────────────────────────────
  {
    time: 0.1,
    background: '#1a0800',
    fog: '#180700',
    hemisphereSky: '#2a1000',
    hemisphereGround: '#0e0600',
    hemisphereIntensity: 0.25,
    sunColor: '#cc4000',
    sunIntensity: 0.15,
    sunPosition: [65, 4, 22],
    moonColor: '#8899cc',
    moonIntensity: 0.18,
    moonPosition: [-28, 42, 10],
    oceanDeep: '#0e1e30',
    oceanMid: '#162438',
    foam: '#9a8470',
    sparkle: '#ffc9be',
    fresnel: 0.45,
    specular: 0.35,
  },
  // ── Sunrise ─────────────────────────────────────────────────────────────────
  {
    time: 0.18,
    background: '#dea050',
    fog: '#e8bc98',
    hemisphereSky: '#e8a858',
    hemisphereGround: '#382008',
    hemisphereIntensity: 0.8,
    sunColor: '#ffd878',
    sunIntensity: 0.9,
    sunPosition: [68, 22, 20],
    moonColor: '#8899cc',
    moonIntensity: 0.0,
    moonPosition: [-28, 42, 10],
    oceanDeep: '#2a4e6a',
    oceanMid: '#3a6882',
    foam: '#d4a860',
    sparkle: '#ffd5a1',
    fresnel: 0.85,
    specular: 0.9,
  },
  // ── Morning ─────────────────────────────────────────────────────────────────
  {
    time: 0.28,
    background: '#6ab8dc',
    fog: '#e4dcd8',
    hemisphereSky: '#88c8ee',
    hemisphereGround: '#223a1a',
    hemisphereIntensity: 0.9,
    sunColor: '#ffe0a0',
    sunIntensity: 1.25,
    sunPosition: [38, 58, 14],
    moonColor: '#8899cc',
    moonIntensity: 0.0,
    moonPosition: [0, 80, 5],
    oceanDeep: '#1e8ab8',
    oceanMid: '#40aad4',
    foam: '#e8e0d0',
    sparkle: '#fff1d0',
    fresnel: 1.0,
    specular: 1.0,
  },
  // ── Noon ────────────────────────────────────────────────────────────────────
  {
    time: 0.38,
    background: '#2090bc',
    fog: '#d8eaf8',
    hemisphereSky: '#d8eeff',
    hemisphereGround: '#1a3a5c',
    hemisphereIntensity: 1.5,
    sunColor: '#fff8e0',
    sunIntensity: 2.2,
    sunPosition: [10, 100, 10],
    moonColor: '#8899cc',
    moonIntensity: 0.0,
    moonPosition: [0, 80, 5],
    oceanDeep: '#27a3d8',
    oceanMid: '#59c0e8',
    foam: '#ffffff',
    sparkle: '#fff6dc',
    fresnel: 1.0,
    specular: 1.0,
  },
  // ── Afternoon ───────────────────────────────────────────────────────────────
  {
    time: 0.5,
    background: '#2888b8',
    fog: '#b0d0e8',
    hemisphereSky: '#a8ccee',
    hemisphereGround: '#182840',
    hemisphereIntensity: 1.0,
    sunColor: '#ffd890',
    sunIntensity: 1.3,
    sunPosition: [-42, 68, 14],
    moonColor: '#8899cc',
    moonIntensity: 0.0,
    moonPosition: [0, 80, 5],
    oceanDeep: '#2092c2',
    oceanMid: '#4aaee0',
    foam: '#f0f2f8',
    sparkle: '#fff0c8',
    fresnel: 1.0,
    specular: 1.0,
  },
  // ── Sunset ──────────────────────────────────────────────────────────────────
  {
    time: 0.6,
    background: '#c07010',
    fog: '#d8b080',
    hemisphereSky: '#d08020',
    hemisphereGround: '#2e1800',
    hemisphereIntensity: 0.6,
    sunColor: '#ffb030',
    sunIntensity: 0.65,
    sunPosition: [-72, 18, 18],
    moonColor: '#8899cc',
    moonIntensity: 0.0,
    moonPosition: [40, 30, -15],
    oceanDeep: '#2a4060',
    oceanMid: '#3a5878',
    foam: '#d4a840',
    sparkle: '#ffd090',
    fresnel: 0.9,
    specular: 0.9,
  },
  // ── Dusk / twilight ─────────────────────────────────────────────────────────
  {
    time: 0.68,
    background: '#180540',
    fog: '#120430',
    hemisphereSky: '#1e0a50',
    hemisphereGround: '#0e0620',
    hemisphereIntensity: 0.15,
    sunColor: '#000000',
    sunIntensity: 0.0,
    sunPosition: [-72, -8, 14],
    moonColor: '#8899cc',
    moonIntensity: 0.5,
    moonPosition: [30, 35, -12],
    oceanDeep: '#080a1a',
    oceanMid: '#0c1225',
    foam: '#8a97b8',
    sparkle: '#f5c3e6',
    fresnel: 0.5,
    specular: 0.3,
  },
  // ── Night ───────────────────────────────────────────────────────────────────
  {
    time: 0.76,
    background: '#050818',
    fog: '#040612',
    hemisphereSky: '#060c1c',
    hemisphereGround: '#03080e',
    hemisphereIntensity: 0.1,
    sunColor: '#000000',
    sunIntensity: 0.0,
    sunPosition: [-40, -60, 0],
    moonColor: '#8899cc',
    moonIntensity: 1.0,
    moonPosition: [15, 60, -8],
    oceanDeep: '#030712',
    oceanMid: '#060a18',
    foam: '#7f8bbe',
    sparkle: '#d5e3ff',
    fresnel: 0.3,
    specular: 0.12,
  },
  // ── Midnight ────────────────────────────────────────────────────────────────
  {
    time: 0.88,
    background: '#020408',
    fog: '#020306',
    hemisphereSky: '#04080e',
    hemisphereGround: '#020406',
    hemisphereIntensity: 0.07,
    sunColor: '#000000',
    sunIntensity: 0.0,
    sunPosition: [0, -80, -10],
    moonColor: '#9aaade',
    moonIntensity: 1.2,
    moonPosition: [5, 80, 5],
    oceanDeep: '#020510',
    oceanMid: '#040816',
    foam: '#8b96c8',
    sparkle: '#cfe0ff',
    fresnel: 0.25,
    specular: 0.08,
  },
  { ...PRE_DAWN, time: 1 },
]

const parseKeyframe = (raw: RawKeyframe): Keyframe => ({
  ...raw,
  background: new THREE.Color(raw.background),
  fog: new THREE.Color(raw.fog),
  hemisphereSky: new THREE.Color(raw.hemisphereSky),
  hemisphereGround: new THREE.Color(raw.hemisphereGround),
  sunColor: new THREE.Color(raw.sunColor),
  moonColor: new THREE.Color(raw.moonColor),
  oceanDeep: new THREE.Color(raw.oceanDeep),
  oceanMid: new THREE.Color(raw.oceanMid),
  foam: new THREE.Color(raw.foam),
  sparkle: new THREE.Color(raw.sparkle),
})

export const KEYFRAMES = RAW_KEYFRAMES.map(parseKeyframe)

export const BRIGHTEST_MOON = 1.2

export const PHASES = {
  'pre-dawn': 0.0,
  'first light': 0.1,
  sunrise: 0.18,
  morning: 0.28,
  noon: 0.38,
  afternoon: 0.5,
  sunset: 0.6,
  dusk: 0.68,
  night: 0.76,
  midnight: 0.88,
} as const

export type PhaseName = keyof typeof PHASES

const _sample: KeyframeSample = { from: KEYFRAMES[0], to: KEYFRAMES[1], blend: 0 }

export function sampleKeyframes(cycleTime: number): KeyframeSample {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (cycleTime <= KEYFRAMES[i + 1].time) {
      const from = KEYFRAMES[i]
      const to = KEYFRAMES[i + 1]
      const span = to.time - from.time
      _sample.from = from
      _sample.to = to
      _sample.blend = span > 0 ? (cycleTime - from.time) / span : 0
      return _sample
    }
  }
  _sample.from = KEYFRAMES[KEYFRAMES.length - 2]
  _sample.to = KEYFRAMES[KEYFRAMES.length - 1]
  _sample.blend = 1
  return _sample
}
