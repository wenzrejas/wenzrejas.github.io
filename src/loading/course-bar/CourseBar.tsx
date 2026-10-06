import type { CSSProperties } from 'react'
import { useSvgId } from '@/hooks/useSvgId'
import {
  COURSE_HEIGHT,
  COURSE_WIDTH,
  HARBOR_GAP,
  HARBOR_RADIUS,
  TRACK_END,
  TRACK_START,
  WHEEL_CENTER,
  WHEEL_HUB,
  WHEEL_RIM,
} from './constants'
import { headPath, WHEEL_SPOKES_PATH } from './courseBarModel'
import './CourseBar.scss'

const MIDDLE = COURSE_HEIGHT / 2
const TRACK_LENGTH = TRACK_END - TRACK_START
const TRACK = { '--track-length': `${TRACK_LENGTH}px` } as CSSProperties

interface CourseBarProps {
  isHidden: boolean
}

export default function CourseBar({ isHidden }: CourseBarProps) {
  const sailedId = useSvgId()

  return (
    <svg
      className={isHidden ? 'course-bar course-bar--hidden' : 'course-bar'}
      width={COURSE_WIDTH}
      height={COURSE_HEIGHT}
      viewBox={`0 0 ${COURSE_WIDTH} ${COURSE_HEIGHT}`}
      style={TRACK}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={sailedId}>
          <rect
            className="course-bar__sailed"
            x={TRACK_START}
            y={0}
            width={TRACK_LENGTH}
            height={COURSE_HEIGHT}
          />
        </clipPath>
      </defs>
      <line className="course-bar__track" x1={TRACK_START} y1={MIDDLE} x2={TRACK_END} y2={MIDDLE} />
      <line
        className="course-bar__wake"
        x1={TRACK_START}
        y1={MIDDLE}
        x2={TRACK_END}
        y2={MIDDLE}
        clipPath={`url(#${sailedId})`}
      />
      <path className="course-bar__head" d={headPath(MIDDLE)} />
      <circle
        className="course-bar__harbor"
        cx={TRACK_END + HARBOR_GAP + HARBOR_RADIUS}
        cy={MIDDLE}
        r={HARBOR_RADIUS}
      />
      <g transform={`translate(${WHEEL_CENTER} ${MIDDLE})`}>
        <g className="course-bar__wheel">
          <circle r={WHEEL_RIM} />
          <circle r={WHEEL_HUB} />
          <path d={WHEEL_SPOKES_PATH} />
        </g>
      </g>
    </svg>
  )
}
