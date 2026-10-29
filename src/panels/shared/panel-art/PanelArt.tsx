import { useState } from 'react'
import { useSvgId } from '@/hooks/useSvgId'
import {
  ART_BOARD,
  PAINTING,
  WASH,
  WASH_FADE_FROM,
  WASH_FEATHER,
  WASH_FREQUENCY,
  WASH_OCTAVES,
  WASH_RAGGEDNESS,
  WASH_SEED,
} from './constants'
import './PanelArt.scss'

interface PanelArtProps {
  splashUrl: string
  zoom?: number
}

const zoomedPainting = (zoom: number) => ({
  x: PAINTING.x - (PAINTING.width * (zoom - 1)) / 2,
  y: PAINTING.y - (PAINTING.height * (zoom - 1)) / 2,
  width: PAINTING.width * zoom,
  height: PAINTING.height * zoom,
})

export default function PanelArt({ splashUrl, zoom = 1 }: PanelArtProps) {
  const baseId = useSvgId()
  const raggedId = `${baseId}-ragged`
  const washId = `${baseId}-wash`
  const fadeId = `${baseId}-fade`
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
        <radialGradient id={fadeId}>
          <stop offset={WASH_FADE_FROM} stopColor="#ffffff" />
          <stop offset={1} stopColor="#000000" />
        </radialGradient>
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
            fill={`url(#${fadeId})`}
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
        href={splashUrl}
        {...zoomedPainting(zoom)}
        mask={isPaintingLoaded ? `url(#${washId})` : undefined}
        onLoad={() => setPaintingLoaded(true)}
      />
    </svg>
  )
}
