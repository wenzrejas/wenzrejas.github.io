import { memo, useMemo } from 'react'
import { ISLAND_COPY } from '@/data/islandCopy'
import type { IslandKey } from '@/world/islands/shared/constants'
import { thumbnailStyle } from '../map-art/mapArtModel'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from './constants'
import './IslandCard.scss'

interface IslandCardProps {
  island: IslandKey
  isSelected: boolean
  onSelect: (island: IslandKey) => void
}

function IslandCard({ island, isSelected, onSelect }: IslandCardProps) {
  const { label, description } = ISLAND_COPY[island]
  const thumbnail = useMemo(
    () => thumbnailStyle(island, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT),
    [island]
  )

  return (
    <button
      type="button"
      className={isSelected ? 'island-card island-card--selected' : 'island-card'}
      aria-pressed={isSelected}
      onClick={() => onSelect(island)}
    >
      <span className="island-card__thumbnail" style={thumbnail} />
      <span className="island-card__text">
        <span className="island-card__name">{label}</span>
        <span className="island-card__tagline">{description}</span>
      </span>
    </button>
  )
}

export default memo(IslandCard)
