import { memo, useMemo, useRef } from 'react'
import { useElementSize } from '@/hooks/useElementSize'
import { useSvgId } from '@/hooks/useSvgId'
import { CORNER_CURL, drawCartouche } from './cartoucheModel'
import { CARTOUCHE_SHADOWS } from './constants'
import './Cartouche.scss'

function Cartouche() {
  const frameRef = useRef<HTMLSpanElement>(null)
  const { width, height } = useElementSize(frameRef)
  const baseId = useSvgId()
  const bandId = `${baseId}-band`
  const clipId = `${baseId}-clip`
  const outsideId = `${baseId}-outside`
  const softenId = `${baseId}-soften`
  const drawing = useMemo(
    () => (width > 0 && height > 0 ? drawCartouche(width, height) : null),
    [width, height]
  )
  return (
    <span ref={frameRef} className="cartouche" aria-hidden="true">
      {drawing && (
        <svg className="cartouche__canvas" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id={bandId} x1={0} y1={0} x2={0} y2={1}>
              <stop offset={0} className="cartouche__band-top" />
              <stop offset={1} className="cartouche__band-bottom" />
            </linearGradient>
            <clipPath id={clipId}>
              <path d={drawing.face} />
            </clipPath>
            <mask id={outsideId} maskUnits="userSpaceOnUse">
              <rect x={-width} y={-height} width={width * 3} height={height * 3} fill="#ffffff" />
              <path d={drawing.outline} fill="#000000" />
            </mask>
            {CARTOUCHE_SHADOWS.map(({ blur }, i) => (
              <filter
                key={blur}
                id={`${softenId}-${i}`}
                x="-20%"
                y="-40%"
                width="140%"
                height="200%"
              >
                <feGaussianBlur stdDeviation={blur} />
              </filter>
            ))}
          </defs>
          <g className="cartouche__elevation" mask={`url(#${outsideId})`}>
            {CARTOUCHE_SHADOWS.map(({ drop, opacity }, i) => (
              <path
                key={drop}
                d={drawing.outline}
                className="cartouche__shadow"
                opacity={opacity}
                transform={`translate(0 ${drop})`}
                filter={`url(#${softenId}-${i})`}
              />
            ))}
          </g>
          <path d={drawing.face} className="cartouche__face" />
          <path d={drawing.face} className="cartouche__aging" clipPath={`url(#${clipId})`} />
          <path
            d={`${drawing.outline}${drawing.face}`}
            fill={`url(#${bandId})`}
            fillRule="evenodd"
          />
          <path d={drawing.sheen} className="cartouche__sheen" />
          <path d={drawing.outline} className="cartouche__edge" />
          <path d={drawing.face} className="cartouche__edge" />
          <path d={drawing.line} className="cartouche__line" />
          {drawing.curlTransforms.map((transform) => (
            <path
              key={transform}
              d={CORNER_CURL}
              transform={transform}
              className="cartouche__line"
            />
          ))}
        </svg>
      )}
    </span>
  )
}

export default memo(Cartouche)
