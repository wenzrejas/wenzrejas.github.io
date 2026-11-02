import type { ProjectKey } from '@/store/panelStore'

export const COLLECTED_BOTTLES = [
  'whySea',
  'dayOne',
  'meetTheVoyager',
  'whereItStarted',
  'stillTicking',
  'homePort',
  'nightOwl',
  'stillOnTheMap',
  'homework',
  'aTip',
  'offTheClock',
  'asleep',
] as const
export const LAST_BOTTLE = 'foundThemAll'

export type BottleKey = (typeof COLLECTED_BOTTLES)[number] | typeof LAST_BOTTLE
export type BottlePanel = ProjectKey | 'contact'

export const ALL_BOTTLES: readonly BottleKey[] = [...COLLECTED_BOTTLES, LAST_BOTTLE]

export const BOTTLE_SPOTS: Record<BottleKey, { x: number; z: number }> = {
  whySea: { x: 0, z: -170 },
  dayOne: { x: 420, z: -120 },
  meetTheVoyager: { x: -240, z: 220 },
  whereItStarted: { x: 60, z: 700 },
  stillTicking: { x: -430, z: 760 },
  homePort: { x: -620, z: 60 },
  nightOwl: { x: -720, z: 540 },
  stillOnTheMap: { x: -200, z: -480 },
  homework: { x: 400, z: -600 },
  aTip: { x: 800, z: 40 },
  offTheClock: { x: 330, z: 330 },
  asleep: { x: 90, z: -960 },
  foundThemAll: { x: 560, z: 590 },
}

export const BOTTLE_PANELS: Partial<Record<BottleKey, BottlePanel>> = {
  stillOnTheMap: 'beeSigned',
  foundThemAll: 'contact',
}

export const collectedCount = (found: readonly BottleKey[]) =>
  found.filter((bottle) => bottle !== LAST_BOTTLE).length

export const hasLastBottleWashedUp = (found: readonly BottleKey[]) =>
  COLLECTED_BOTTLES.every((bottle) => found.includes(bottle))

export const isBottleAfloat = (bottle: BottleKey, found: readonly BottleKey[]) =>
  !found.includes(bottle) && (bottle !== LAST_BOTTLE || hasLastBottleWashedUp(found))

export const bottlesAfloat = (found: readonly BottleKey[]) =>
  ALL_BOTTLES.filter((bottle) => isBottleAfloat(bottle, found))

export const bottleWithin = (bottles: readonly BottleKey[], x: number, z: number, reach: number) =>
  bottles.find((bottle) => {
    const spot = BOTTLE_SPOTS[bottle]
    return Math.hypot(x - spot.x, z - spot.z) < reach
  })
