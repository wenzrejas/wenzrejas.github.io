import { useId } from 'react'
import { ISLAND_COPY } from '@/data/islandCopy'
import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import { closeWorldMap, useViewStore } from '@/store/viewStore'
import './WorldMap.scss'

export default function WorldMap() {
  const isMapOpen = useViewStore((state) => state.isMapOpen)
  const titleId = useId()

  if (!isMapOpen) return null

  return (
    <section className="world-map" aria-labelledby={titleId}>
      <div className="world-map__illustration">
        <button type="button" className="world-map__back" onClick={closeWorldMap}>
          {WORLD_MAP_COPY.back}
        </button>
        <h2 id={titleId} className="world-map__title">
          {WORLD_MAP_COPY.title}
        </h2>
      </div>
      <aside className="world-map__islands">
        <h3 className="world-map__heading">{WORLD_MAP_COPY.islandsHeading}</h3>
        <ul className="world-map__list">
          {Object.entries(ISLAND_COPY).map(([key, { label, description }]) => (
            <li key={key} className="world-map__island">
              <span className="world-map__name">{label}</span>
              <span className="world-map__tagline">{description}</span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}
