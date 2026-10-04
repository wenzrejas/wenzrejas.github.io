import { COMPASS_ROSE } from './compassRoseModel'
import { COMPASS_VIEW_REACH } from './constants'
import './CompassRose.scss'

const VIEW_BOX = `${-COMPASS_VIEW_REACH} ${-COMPASS_VIEW_REACH} ${COMPASS_VIEW_REACH * 2} ${COMPASS_VIEW_REACH * 2}`

interface CompassRoseProps {
  className?: string
}

export default function CompassRose({ className }: CompassRoseProps) {
  return (
    <svg className={className} viewBox={VIEW_BOX} aria-hidden="true">
      <g className="compass-rose__ink">
        <circle r={COMPASS_ROSE.innerRing} />
        <circle r={COMPASS_ROSE.outerRing} className="compass-rose__dashed" />
        <path d={COMPASS_ROSE.rays} className="compass-rose__dashed" />
        <path d={COMPASS_ROSE.shading} className="compass-rose__shade" />
        <path d={COMPASS_ROSE.outline} />
        {COMPASS_ROSE.letters.map(({ label, x, y }) => (
          <text key={label} x={x} y={y} className="compass-rose__letter">
            {label}
          </text>
        ))}
      </g>
    </svg>
  )
}
