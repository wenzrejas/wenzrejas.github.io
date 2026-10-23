import type * as THREE from 'three'
import type { WallClock } from '@/utils/time'
import type { Surfacing } from '../surfacing/surfacing'
import type { Timeline } from '../timeline/timeline'
import Armillary from './armillary/Armillary'
import Chronometer from './chronometer/Chronometer'
import Crescent from './crescent/Crescent'
import CubeStack from './cube-stack/CubeStack'
import OpenBook from './open-book/OpenBook'
import PortalArch from './portal-arch/PortalArch'

interface RuinLifeProps {
  ruins: THREE.Object3D[]
  timeline: Timeline
  surfacing: Surfacing
  clock: WallClock
}

const MILESTONES = [PortalArch, Armillary, OpenBook, CubeStack, Crescent, Chronometer]

export default function RuinLife({ ruins, timeline, surfacing, clock }: RuinLifeProps) {
  return (
    <>
      {MILESTONES.map((Milestone, level) =>
        ruins[level] ? (
          <Milestone
            key={level}
            ruin={ruins[level]}
            level={level}
            timeline={timeline}
            surfacing={surfacing}
            clock={clock}
          />
        ) : null
      )}
    </>
  )
}
