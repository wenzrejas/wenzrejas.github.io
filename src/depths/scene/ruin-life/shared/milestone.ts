import type * as THREE from 'three'
import type { Surfacing } from '@/depths/scene/surfacing/surfacing'
import type { Timeline } from '@/depths/scene/timeline/timeline'
import type { WallClock } from '@/utils/time'

export interface MilestoneProps {
  ruin: THREE.Object3D
  level: number
  timeline: Timeline
  surfacing: Surfacing
  clock: WallClock
}
