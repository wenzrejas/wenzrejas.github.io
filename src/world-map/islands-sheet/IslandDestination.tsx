import { useMemo, useRef } from 'react'
import { ISLAND_COPY } from '@/data/islandCopy'
import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import { useElementSize } from '@/hooks/useElementSize'
import type { IslandKey } from '@/world/islands/shared/constants'
import { MAP_SCROLL_URL } from '../islands-panel/constants'
import SetSailRibbon from '../set-sail-ribbon/SetSailRibbon'
import { destinationThumbnailStyle } from './destinationModel'
import './IslandDestination.scss'

interface IslandDestinationProps {
  island: IslandKey
  onSetSail: () => void
  onOpenList: () => void
}

export default function IslandDestination({
  island,
  onSetSail,
  onOpenList,
}: IslandDestinationProps) {
  const { label, description } = ISLAND_COPY[island]
  const cardRef = useRef<HTMLDivElement>(null)
  const { width } = useElementSize(cardRef)
  const thumbnail = useMemo(() => destinationThumbnailStyle(island, width), [island, width])

  return (
    <div ref={cardRef} className="island-destination">
      <span className="island-destination__thumbnail" style={thumbnail} />
      <div className="island-destination__text">
        <span className="island-destination__name">{label}</span>
        <span className="island-destination__tagline">{description}</span>
      </div>
      <SetSailRibbon onSetSail={onSetSail} />
      <button
        type="button"
        className="island-destination__change"
        aria-label={WORLD_MAP_COPY.islandsHeading}
        onClick={onOpenList}
      >
        <img
          className="island-destination__change-icon"
          src={MAP_SCROLL_URL}
          alt=""
          draggable={false}
        />
      </button>
    </div>
  )
}
