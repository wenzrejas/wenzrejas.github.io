import { ARRIVAL_LEVEL } from '../constants'
import type { Timeline } from '../timeline/timeline'
import { SURFACE_GLOW_LEVELS } from './constants'

export const surfaceGlowOf = ({ viewedLevel }: Timeline) =>
  Math.exp(-Math.max(viewedLevel - ARRIVAL_LEVEL, 0) / SURFACE_GLOW_LEVELS)
