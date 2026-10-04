import { useState } from 'react'
import { useSvgId } from '@/hooks/useSvgId'
import {
  ART_BOARD,
  PAINTING,
  WASH,
  WASH_FEATHER,
  WASH_FREQUENCY,
  WASH_OCTAVES,
  WASH_RAGGEDNESS,
  WASH_SEED,
} from './constants'
import './PanelArt.scss'

interface PanelArtProps {
  paintingUrl: string
}

export default function PanelArt({ paintingUrl }: PanelArtProps) {
  const baseId = useSvgId()
  const raggedId = `${baseId}-ragged`
  const washId = `${baseId}-wash`
  const [isPaintingLoaded, setPaintingLoaded] = useState(false)

  return (
    <svg
      className="panel-art"
      viewBox={`0 0 ${ART_BOARD.width} ${ART_BOARD.height}`}
      aria-hidden="true"
    >
      <defs>
        <filter id={raggedId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={WASH_FREQUENCY}
            numOctaves={WASH_OCTAVES}
            seed={WASH_SEED}
            result="ripples"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="ripples"
            scale={WASH_RAGGEDNESS}
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation={WASH_FEATHER} />
        </filter>
        <mask
          id={washId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={ART_BOARD.width}
          height={ART_BOARD.height}
        >
          <ellipse
            cx={WASH.x}
            cy={WASH.y}
            rx={WASH.radiusX}
            ry={WASH.radiusY}
            fill="#ffffff"
            filter={`url(#${raggedId})`}
          />
        </mask>
      </defs>
      <image
        className={
          isPaintingLoaded
            ? 'panel-art__painting panel-art__painting--loaded'
            : 'panel-art__painting'
        }
        href={paintingUrl}
        {...PAINTING}
        mask={isPaintingLoaded ? `url(#${washId})` : undefined}
        onLoad={() => setPaintingLoaded(true)}
      />
    </svg>
  )
}
