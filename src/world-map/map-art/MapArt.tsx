import { useMemo, useRef } from 'react'
import { ISLAND_COPY } from '@/data/islandCopy'
import { useElementSize } from '@/hooks/useElementSize'
import { useCompactLayout } from '@/utils/layout'
import type { IslandKey } from '@/world/islands/shared/constants'
import SetSailTooltip from '../set-sail-tooltip/SetSailTooltip'
import type { MapMotion } from '../types'
import { MAP_ART_STYLE, placeMapArt } from './mapArtModel'
import './MapArt.scss'

interface MapArtProps {
  selectedIsland: IslandKey | null
  motion: MapMotion | null
  onSetSail?: () => void
  onSelectIsland: (island: IslandKey) => void
}

export default function MapArt({ selectedIsland, motion, onSetSail, onSelectIsland }: MapArtProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(frameRef)
  const isCompact = useCompactLayout()
  const art = useMemo(
    () => (width > 0 && height > 0 ? placeMapArt(width, height, isCompact) : null),
    [width, height, isCompact]
  )
  const setSailSpot = art?.islands.find(({ island }) => island === selectedIsland)?.setSailSpot

  const modifiers = [motion && `map-art--${motion}`, selectedIsland && 'map-art--focused'].filter(
    Boolean
  )

  return (
    <div ref={frameRef} className={['map-art', ...modifiers].join(' ')} style={MAP_ART_STYLE}>
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
      {art?.islands.map(({ island, style }) => {
        const isSelected = island === selectedIsland
        return (
          <button
            key={island}
            type="button"
            className={isSelected ? 'map-art__island map-art__island--selected' : 'map-art__island'}
            style={style}
            aria-label={ISLAND_COPY[island].label}
            aria-pressed={isSelected}
            onClick={() => onSelectIsland(island)}
          />
        )
      })}
      {setSailSpot && onSetSail && (
        <SetSailTooltip key={selectedIsland} spot={setSailSpot} onSetSail={onSetSail} />
      )}
    </div>
  )
}
