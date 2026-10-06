import { useEffect, useMemo, useRef } from 'react'
import { useElementSize } from '@/hooks/useElementSize'
import { atlasImage, imageryStyle, pieceStyles } from './mapImageryModel'
import './MapImagery.scss'

interface MapImageryProps {
  isCharted: boolean
}

export default function MapImagery({ isCharted }: MapImageryProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(frameRef)
  const imagery = useMemo(() => imageryStyle(), [])
  const pieces = useMemo(
    () => (width > 0 && height > 0 ? pieceStyles(width, height) : []),
    [width, height]
  )

  useEffect(() => {
    atlasImage()
  }, [])

  return (
    <div
      ref={frameRef}
      className={isCharted ? 'map-imagery map-imagery--charted' : 'map-imagery'}
      style={imagery}
      aria-hidden="true"
    >
      {pieces.map(({ key, style }) => (
        <div key={key} className="map-imagery__piece" style={style} />
      ))}
    </div>
  )
}
