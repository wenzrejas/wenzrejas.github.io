import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import { useSvgId } from '@/hooks/useSvgId'
import { WOBBLE_FREQUENCY, WOBBLE_OCTAVES, WOBBLE_SEED, WOBBLE_STRENGTH } from './constants'
import { RIBBON_BAND, RIBBON_BOX, RIBBON_FOLDS, RIBBON_HATCHES, RIBBON_TAILS } from './ribbonModel'
import './SetSailRibbon.scss'

interface SetSailRibbonProps {
  onSetSail: () => void
}

export default function SetSailRibbon({ onSetSail }: SetSailRibbonProps) {
  const wobbleId = `${useSvgId()}-wobble`

  return (
    <button type="button" className="set-sail-ribbon" onClick={onSetSail}>
      <svg
        className="set-sail-ribbon__art"
        viewBox={RIBBON_BOX}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
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
            <path key={tail} className="set-sail-ribbon__tail" d={tail} />
          ))}
          {RIBBON_FOLDS.map((fold) => (
            <path key={fold} className="set-sail-ribbon__fold" d={fold} />
          ))}
          {RIBBON_HATCHES.map((hatch) => (
            <path key={hatch} className="set-sail-ribbon__hatch" d={hatch} />
          ))}
        </g>
        <path className="set-sail-ribbon__band" d={RIBBON_BAND} />
      </svg>
      <span className="set-sail-ribbon__label">{WORLD_MAP_COPY.setSail}</span>
    </button>
  )
}
