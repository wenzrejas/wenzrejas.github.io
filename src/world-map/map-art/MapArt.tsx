import { useMemo, useRef } from 'react'
import { useElementSize } from '@/hooks/useElementSize'
import type { IslandKey } from '@/world/islands/shared/constants'
import type { MapMotion } from '../types'
import { MAP_ART_STYLE, placeMapArt } from './mapArtModel'
import './MapArt.scss'

interface MapArtProps {
  selectedIsland: IslandKey | null
  motion: MapMotion | null
}

export default function MapArt({ selectedIsland, motion }: MapArtProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(frameRef)
  const art = useMemo(
    () => (width > 0 && height > 0 ? placeMapArt(width, height) : null),
    [width, height]
  )

  const modifiers = [motion && `map-art--${motion}`, selectedIsland && 'map-art--focused'].filter(
    Boolean
  )

  return (
    <div
      ref={frameRef}
      className={['map-art', ...modifiers].join(' ')}
      style={MAP_ART_STYLE}
      aria-hidden="true"
    >
      {art?.decorations.map(({ key, kind, style }) => (
        <div
          key={key}
          className={`map-art__decoration map-art__decoration--${kind}`}
          style={style}
        />
      ))}
      {art?.rocks.map(({ key, style }) => (
        <div key={key} className="map-art__rock" style={style} />
      ))}
      {art?.islands.map(({ island, style }) => (
        <div
          key={island}
          className={
            island === selectedIsland
              ? 'map-art__island map-art__island--selected'
              : 'map-art__island'
          }
          style={style}
        />
      ))}
    </div>
  )
}
