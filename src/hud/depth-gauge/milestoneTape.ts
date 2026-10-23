import { ARRIVAL_LEVEL, DEPTH_LEVEL_COUNT } from '@/depths/scene/constants'
import { PX_PER_LEVEL, TICKS_PER_LEVEL } from './constants'

export interface MilestoneMark {
  y: number
  label: string | null
}

const tapeY = (level: number) => (level - ARRIVAL_LEVEL) * PX_PER_LEVEL

export const tapeOffset = (viewedLevel: number) => -tapeY(viewedLevel)

const chapterOf = (level: number) => String(level + 1).padStart(2, '0')

const TICK_COUNT = (DEPTH_LEVEL_COUNT - 1 - ARRIVAL_LEVEL) * TICKS_PER_LEVEL

export const MILESTONE_MARKS: MilestoneMark[] = []
for (let tick = 0; tick <= TICK_COUNT; tick++) {
  const level = ARRIVAL_LEVEL + tick / TICKS_PER_LEVEL
  const isMilestone = tick % TICKS_PER_LEVEL === 0 && level >= 0
  MILESTONE_MARKS.push({ y: tapeY(level), label: isMilestone ? chapterOf(level) : null })
}
