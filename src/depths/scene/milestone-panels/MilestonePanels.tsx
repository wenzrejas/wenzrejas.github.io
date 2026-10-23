import { DEPTHS_COPY } from '@/data/depthsCopy'
import type { WallClock } from '@/utils/time'
import type { Timeline } from '../timeline/timeline'
import MilestonePanel from './MilestonePanel'

interface MilestonePanelsProps {
  timeline: Timeline
  clock: WallClock
}

export default function MilestonePanels({ timeline, clock }: MilestonePanelsProps) {
  return DEPTHS_COPY.milestones.map((milestone, level) => (
    <MilestonePanel
      key={milestone.chapter}
      level={level}
      milestone={milestone}
      timeline={timeline}
      clock={clock}
    />
  ))
}
