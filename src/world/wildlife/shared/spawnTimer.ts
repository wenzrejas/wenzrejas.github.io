import { eventDelta } from '@/store/cinematicStore'

export const tickSpawnTimer = (remaining: number, longest: number, dt: number) =>
  Math.min(remaining, longest) - eventDelta(dt)
