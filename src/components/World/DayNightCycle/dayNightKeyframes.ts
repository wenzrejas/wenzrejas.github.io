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
}

// Keyframes cover one full cycle (t=0 → t=1).
// First and last are identical for seamless looping.
export const KFS: KF[] = [
  // ── pre-dawn / night ─────────────────────────────────────────────────
  {
    t: 0.00,
    bg: '#0a0620', fog: '#080515',
    hemiSky: '#120830', hemiGround: '#080415', hemiInt: 0.20,
    sunColor: '#000000', sunInt: 0.0, sunPos: [30, -15, 20],
    moonColor: '#8899cc', moonInt: 1.10, moonPos: [5, 80, 5],
    oceanDeep: '#030710', oceanMid: '#060c1a',
    foam: '#253060',
  },
  // ── first light ──────────────────────────────────────────────────────
  {
    t: 0.10,
    bg: '#1a0800', fog: '#180700',
    hemiSky: '#2a1000', hemiGround: '#0e0600', hemiInt: 0.55,
    sunColor: '#cc4000', sunInt: 0.35, sunPos: [65, 4, 22],
    moonColor: '#8899cc', moonInt: 0.18, moonPos: [-28, 42, 10],
    oceanDeep: '#0e1e30', oceanMid: '#162438',
    foam: '#503828',
  },
  // ── sunrise / golden hour ────────────────────────────────────────────
  {
    t: 0.18,
    bg: '#dea050', fog: '#a87830',
    hemiSky: '#e8a858', hemiGround: '#382008', hemiInt: 1.80,
    sunColor: '#ffd878', sunInt: 2.00, sunPos: [68, 22, 20],
    moonColor: '#8899cc', moonInt: 0.0, moonPos: [-28, 42, 10],
    oceanDeep: '#2a4e6a', oceanMid: '#3a6882',
    foam: '#d4a860',
  },
  // ── morning ──────────────────────────────────────────────────────────
  {
    t: 0.28,
    bg: '#6ab8dc', fog: '#88c0e0',
    hemiSky: '#88c8ee', hemiGround: '#223a1a', hemiInt: 2.00,
    sunColor: '#ffe0a0', sunInt: 2.80, sunPos: [38, 58, 14],
    moonColor: '#8899cc', moonInt: 0.0, moonPos: [0, 80, 5],
    oceanDeep: '#1e8ab8', oceanMid: '#40aad4',
    foam: '#e8e0d0',
  },
  // ── noon ─────────────────────────────────────────────────────────────
  {
    t: 0.38,
    bg: '#2090bc', fog: '#d8eaf8',
    hemiSky: '#d8eeff', hemiGround: '#1a3a5c', hemiInt: 3.50,
    sunColor: '#fff8e0', sunInt: 5.00, sunPos: [10, 100, 10],
    moonColor: '#8899cc', moonInt: 0.0, moonPos: [0, 80, 5],
    oceanDeep: '#27a3d8', oceanMid: '#59c0e8',
    foam: '#ffffff',
  },
  // ── afternoon ────────────────────────────────────────────────────────
  {
    t: 0.50,
    bg: '#2888b8', fog: '#b0d0e8',
    hemiSky: '#a8ccee', hemiGround: '#182840', hemiInt: 2.20,
    sunColor: '#ffd890', sunInt: 3.00, sunPos: [-42, 68, 14],
    moonColor: '#8899cc', moonInt: 0.0, moonPos: [0, 80, 5],
    oceanDeep: '#2092c2', oceanMid: '#4aaee0',
    foam: '#f0f2f8',
  },
  // ── sunset / golden hour ─────────────────────────────────────────────
  {
    t: 0.60,
    bg: '#c07010', fog: '#7a4a08',
    hemiSky: '#d08020', hemiGround: '#2e1800', hemiInt: 1.40,
    sunColor: '#ffb030', sunInt: 1.50, sunPos: [-72, 18, 18],
    moonColor: '#8899cc', moonInt: 0.0, moonPos: [40, 30, -15],
    oceanDeep: '#2a4060', oceanMid: '#3a5878',
    foam: '#d4a840',
  },
  // ── dusk / twilight ──────────────────────────────────────────────────
  {
    t: 0.68,
    bg: '#180540', fog: '#120430',
    hemiSky: '#1e0a50', hemiGround: '#0e0620', hemiInt: 0.35,
    sunColor: '#000000', sunInt: 0.0, sunPos: [-72, -8, 14],
    moonColor: '#8899cc', moonInt: 0.50, moonPos: [30, 35, -12],
    oceanDeep: '#080a1a', oceanMid: '#0c1225',
    foam: '#607090',
  },
  // ── night ────────────────────────────────────────────────────────────
  {
    t: 0.76,
    bg: '#050818', fog: '#040612',
    hemiSky: '#060c1c', hemiGround: '#03080e', hemiInt: 0.20,
    sunColor: '#000000', sunInt: 0.0, sunPos: [-40, -60, 0],
    moonColor: '#8899cc', moonInt: 1.00, moonPos: [15, 60, -8],
    oceanDeep: '#030712', oceanMid: '#060a18',
    foam: '#364070',
  },
  // ── midnight ─────────────────────────────────────────────────────────
  {
    t: 0.88,
    bg: '#020408', fog: '#020306',
    hemiSky: '#04080e', hemiGround: '#020406', hemiInt: 0.15,
    sunColor: '#000000', sunInt: 0.0, sunPos: [0, -80, -10],
    moonColor: '#9aaade', moonInt: 1.20, moonPos: [5, 80, 5],
    oceanDeep: '#020510', oceanMid: '#040816',
    foam: '#252e58',
  },
  // ── back to pre-dawn (seamless loop) ─────────────────────────────────
  {
    t: 1.00,
    bg: '#0a0620', fog: '#080515',
    hemiSky: '#120830', hemiGround: '#080415', hemiInt: 0.20,
    sunColor: '#000000', sunInt: 0.0, sunPos: [30, -15, 20],
    moonColor: '#8899cc', moonInt: 1.10, moonPos: [5, 80, 5],
    oceanDeep: '#030710', oceanMid: '#060c1a',
    foam: '#253060',
  },
]

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
