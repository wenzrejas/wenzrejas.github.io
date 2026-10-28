import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import { useSvgId } from '@/hooks/useSvgId'
import type { SetSailSpot } from '../map-art/mapArtModel'
import { WOBBLE_FREQUENCY, WOBBLE_OCTAVES, WOBBLE_SEED, WOBBLE_STRENGTH } from './constants'
import { RIBBON_BAND, RIBBON_BOX, RIBBON_FOLDS, RIBBON_HATCHES, RIBBON_TAILS } from './ribbonModel'
import './SetSailTooltip.scss'

interface SetSailTooltipProps {
  spot: SetSailSpot
  onSetSail: () => void
}

export default function SetSailTooltip({ spot, onSetSail }: SetSailTooltipProps) {
  const wobbleId = `${useSvgId()}-wobble`

  return (
    <div
      className={`set-sail-tooltip set-sail-tooltip--${spot.side}`}
      style={{ left: spot.left, top: spot.top }}
    >
      <button type="button" className="set-sail-tooltip__button" onClick={onSetSail}>
        <svg className="set-sail-tooltip__ribbon" viewBox={RIBBON_BOX} aria-hidden="true">
          <defs>
            <filter id={wobbleId} x="-5%" y="-10%" width="110%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={WOBBLE_FREQUENCY}
                numOctaves={WOBBLE_OCTAVES}
                seed={WOBBLE_SEED}
                result="wobble"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="wobble"
                scale={WOBBLE_STRENGTH}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <g filter={`url(#${wobbleId})`}>
            {RIBBON_TAILS.map((tail) => (
              <path key={tail} className="set-sail-tooltip__tail" d={tail} />
            ))}
            {RIBBON_FOLDS.map((fold) => (
              <path key={fold} className="set-sail-tooltip__fold" d={fold} />
            ))}
            {RIBBON_HATCHES.map((hatch) => (
              <path key={hatch} className="set-sail-tooltip__hatch" d={hatch} />
            ))}
          </g>
          <path className="set-sail-tooltip__band" d={RIBBON_BAND} />
        </svg>
        <span className="set-sail-tooltip__label">{WORLD_MAP_COPY.setSail}</span>
      </button>
    </div>
  )
}
