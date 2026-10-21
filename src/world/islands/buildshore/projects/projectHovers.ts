import { isEngaged } from '@/interaction/hover'
import type { ProjectKey } from '@/store/panelStore'
import {
  createHoverTimeline,
  stepHoverTimeline,
  type HoverTimeline,
} from '@/world/islands/shared/hoverTimeline'
import { PROJECT_HOVER_FULL_SECONDS, PROJECT_HOVER_RELEASE_SECONDS } from './constants'
import { PROJECT_KEYS } from './projectSites'

export type ProjectHovers = Record<ProjectKey, HoverTimeline>

export const createProjectHovers = () =>
  Object.fromEntries(PROJECT_KEYS.map((key) => [key, createHoverTimeline()])) as ProjectHovers

export function stepProjectHovers(hovers: ProjectHovers, dt: number): void {
  for (const key of PROJECT_KEYS) {
    const hover = hovers[key]
    stepHoverTimeline(
      hover,
      isEngaged(hover.isHovered, key),
      dt,
      PROJECT_HOVER_RELEASE_SECONDS,
      PROJECT_HOVER_FULL_SECONDS
    )
  }
}
