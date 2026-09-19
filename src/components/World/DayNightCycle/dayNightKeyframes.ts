export interface KF {
  t: number
  bg: string
  fog: string
  hemiSky: string
  hemiGround: string
  hemiInt: number
  sunColor: string
  sunInt: number
  sunPos: [number, number, number]
  moonColor: string
  moonInt: number
  moonPos: [number, number, number]
  oceanDeep: string
  oceanMid: string
  foam: string
  fresnel: number
  specular: number
}

export const KFS: KF[] = [
  // ── pre-dawn / night ─────────────────────────────────────────────────
  {
    t: 0.0,
    bg: '#0a0620',
    fog: '#080515',
    hemiSky: '#120830',
    hemiGround: '#080415',
    hemiInt: 0.1,
    sunColor: '#000000',
    sunInt: 0.0,
    sunPos: [30, -15, 20],
    moonColor: '#8899cc',
    moonInt: 1.1,
    moonPos: [5, 80, 5],
    oceanDeep: '#030710',
    oceanMid: '#060c1a',
    foam: '#7c88bc',
    fresnel: 0.3,
    specular: 0.12,
  },
  // ── first light ──────────────────────────────────────────────────────
  {
    t: 0.1,
    bg: '#1a0800',
    fog: '#180700',
    hemiSky: '#2a1000',
    hemiGround: '#0e0600',
    hemiInt: 0.25,
    sunColor: '#cc4000',
    sunInt: 0.15,
    sunPos: [65, 4, 22],
    moonColor: '#8899cc',
    moonInt: 0.18,
    moonPos: [-28, 42, 10],
    oceanDeep: '#0e1e30',
    oceanMid: '#162438',
    foam: '#9a8470',
    fresnel: 0.45,
    specular: 0.35,
  },
  // ── sunrise / golden hour ────────────────────────────────────────────
  {
    t: 0.18,
    bg: '#dea050',
    fog: '#a87830',
    hemiSky: '#e8a858',
    hemiGround: '#382008',
    hemiInt: 0.8,
    sunColor: '#ffd878',
    sunInt: 0.9,
    sunPos: [68, 22, 20],
    moonColor: '#8899cc',
    moonInt: 0.0,
    moonPos: [-28, 42, 10],
    oceanDeep: '#2a4e6a',
    oceanMid: '#3a6882',
    foam: '#d4a860',
    fresnel: 0.85,
    specular: 0.9,
  },
  // ── morning ──────────────────────────────────────────────────────────
  {
    t: 0.28,
    bg: '#6ab8dc',
    fog: '#88c0e0',
    hemiSky: '#88c8ee',
    hemiGround: '#223a1a',
    hemiInt: 0.9,
    sunColor: '#ffe0a0',
    sunInt: 1.25,
    sunPos: [38, 58, 14],
    moonColor: '#8899cc',
    moonInt: 0.0,
    moonPos: [0, 80, 5],
    oceanDeep: '#1e8ab8',
    oceanMid: '#40aad4',
    foam: '#e8e0d0',
    fresnel: 1.0,
    specular: 1.0,
  },
  // ── noon ─────────────────────────────────────────────────────────────
  {
    t: 0.38,
    bg: '#2090bc',
    fog: '#d8eaf8',
    hemiSky: '#d8eeff',
    hemiGround: '#1a3a5c',
    hemiInt: 1.5,
    sunColor: '#fff8e0',
    sunInt: 2.2,
    sunPos: [10, 100, 10],
    moonColor: '#8899cc',
    moonInt: 0.0,
    moonPos: [0, 80, 5],
    oceanDeep: '#27a3d8',
    oceanMid: '#59c0e8',
    foam: '#ffffff',
    fresnel: 1.0,
    specular: 1.0,
  },
  // ── afternoon ────────────────────────────────────────────────────────
  {
    t: 0.5,
    bg: '#2888b8',
    fog: '#b0d0e8',
    hemiSky: '#a8ccee',
    hemiGround: '#182840',
    hemiInt: 1.0,
    sunColor: '#ffd890',
    sunInt: 1.3,
    sunPos: [-42, 68, 14],
    moonColor: '#8899cc',
    moonInt: 0.0,
    moonPos: [0, 80, 5],
    oceanDeep: '#2092c2',
    oceanMid: '#4aaee0',
    foam: '#f0f2f8',
    fresnel: 1.0,
    specular: 1.0,
  },
  // ── sunset / golden hour ─────────────────────────────────────────────
  {
    t: 0.6,
    bg: '#c07010',
    fog: '#7a4a08',
    hemiSky: '#d08020',
    hemiGround: '#2e1800',
    hemiInt: 0.6,
    sunColor: '#ffb030',
    sunInt: 0.65,
    sunPos: [-72, 18, 18],
    moonColor: '#8899cc',
    moonInt: 0.0,
    moonPos: [40, 30, -15],
    oceanDeep: '#2a4060',
    oceanMid: '#3a5878',
    foam: '#d4a840',
    fresnel: 0.9,
    specular: 0.9,
  },
  // ── dusk / twilight ──────────────────────────────────────────────────
  {
    t: 0.68,
    bg: '#180540',
    fog: '#120430',
    hemiSky: '#1e0a50',
    hemiGround: '#0e0620',
    hemiInt: 0.15,
    sunColor: '#000000',
    sunInt: 0.0,
    sunPos: [-72, -8, 14],
    moonColor: '#8899cc',
    moonInt: 0.5,
    moonPos: [30, 35, -12],
    oceanDeep: '#080a1a',
    oceanMid: '#0c1225',
    foam: '#8a97b8',
    fresnel: 0.5,
    specular: 0.3,
  },
  // ── night ────────────────────────────────────────────────────────────
  {
    t: 0.76,
    bg: '#050818',
    fog: '#040612',
    hemiSky: '#060c1c',
    hemiGround: '#03080e',
    hemiInt: 0.1,
    sunColor: '#000000',
    sunInt: 0.0,
    sunPos: [-40, -60, 0],
    moonColor: '#8899cc',
    moonInt: 1.0,
    moonPos: [15, 60, -8],
    oceanDeep: '#030712',
    oceanMid: '#060a18',
    foam: '#7f8bbe',
    fresnel: 0.3,
    specular: 0.12,
  },
  // ── midnight ─────────────────────────────────────────────────────────
  {
    t: 0.88,
    bg: '#020408',
    fog: '#020306',
    hemiSky: '#04080e',
    hemiGround: '#020406',
    hemiInt: 0.07,
    sunColor: '#000000',
    sunInt: 0.0,
    sunPos: [0, -80, -10],
    moonColor: '#9aaade',
    moonInt: 1.2,
    moonPos: [5, 80, 5],
    oceanDeep: '#020510',
    oceanMid: '#040816',
    foam: '#8b96c8',
    fresnel: 0.25,
    specular: 0.08,
  },
  // ── back to pre-dawn (seamless loop) ─────────────────────────────────
  {
    t: 1.0,
    bg: '#0a0620',
    fog: '#080515',
    hemiSky: '#120830',
    hemiGround: '#080415',
    hemiInt: 0.1,
    sunColor: '#000000',
    sunInt: 0.0,
    sunPos: [30, -15, 20],
    moonColor: '#8899cc',
    moonInt: 1.1,
    moonPos: [5, 80, 5],
    oceanDeep: '#030710',
    oceanMid: '#060c1a',
    foam: '#7c88bc',
    fresnel: 0.3,
    specular: 0.12,
  },
]

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

export function sampleKeyframes(ct: number): { lo: KF; hi: KF; a: number } {
  for (let i = 0; i < KFS.length - 1; i++) {
    if (ct <= KFS[i + 1].t) {
      const lo = KFS[i]
      const hi = KFS[i + 1]
      const span = hi.t - lo.t
      return { lo, hi, a: span > 0 ? (ct - lo.t) / span : 0 }
    }
  }
  const lo = KFS[KFS.length - 2]
  const hi = KFS[KFS.length - 1]
  return { lo, hi, a: 1 }
}
