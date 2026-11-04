export interface Lantern {
  x: number
  z: number
  driftX: number
  driftZ: number
  seed: number
  ageSeconds: number
  litSeconds: number | null
  leaveSeconds: number | null
  isFinale: boolean
}

type LanternPhase = 'idle' | 'waiting' | 'afloat' | 'finale'

export const flock: Lantern[] = []

export const lanternShow = {
  phase: 'idle' as LanternPhase,
  run: 0,
  finaleSeconds: 0,
  released: 0,
}

export const isLanternFinalePlaying = () => lanternShow.phase === 'finale'

export const isWaitingToBeLit = (lantern: Lantern) =>
  lantern.litSeconds === null && lantern.leaveSeconds === null

export const isLanternWithin = (x: number, z: number, reach: number) =>
  flock.some(
    (lantern) => isWaitingToBeLit(lantern) && Math.hypot(lantern.x - x, lantern.z - z) < reach
  )
