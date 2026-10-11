import { useId, type CSSProperties } from 'react'
import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import Cartouche from '@/panels/shared/cartouche/Cartouche'
import type { IslandKey } from '@/world/islands/shared/constants'
import type { MapMotion } from '../types'
import { CLOSE_BUTTON_URL, ISLAND_LIST_ORDER, MAP_SCROLL_URL, SHEET_URL } from './constants'
import IslandCard from './IslandCard'
import './IslandsPanel.scss'

interface IslandsPanelProps {
  selectedIsland: IslandKey | null
  motion: MapMotion | null
  onSelect: (island: IslandKey) => void
  onSetSail: () => void
  onClose: () => void
}

const SHEET_STYLE = { '--sheet': `url(${SHEET_URL})` } as CSSProperties

const entryStyle = (index: number) => ({ '--entry-index': index }) as CSSProperties

export default function IslandsPanel({
  selectedIsland,
  motion,
  onSelect,
  onSetSail,
  onClose,
}: IslandsPanelProps) {
  const headingId = useId()

  return (
    <aside
      className={motion ? `islands-panel islands-panel--${motion}` : 'islands-panel'}
      style={SHEET_STYLE}
      aria-labelledby={headingId}
    >
      <button
        type="button"
        className="islands-panel__close"
        aria-label={WORLD_MAP_COPY.close}
        onClick={onClose}
      >
        <img className="islands-panel__close-art" src={CLOSE_BUTTON_URL} alt="" draggable={false} />
      </button>
      <div className="islands-panel__content">
        <div className="islands-panel__header">
          <img className="islands-panel__icon" src={MAP_SCROLL_URL} alt="" draggable={false} />
          <h2 id={headingId} className="islands-panel__heading">
            {WORLD_MAP_COPY.islandsHeading}
          </h2>
        </div>
        <div className="islands-panel__rule" />
        <ul className="islands-panel__list">
          {ISLAND_LIST_ORDER.map((island, index) => (
            <li key={island} className="islands-panel__item" style={entryStyle(index)}>
              <IslandCard
                island={island}
                isSelected={island === selectedIsland}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
        <div
          className={
            selectedIsland
              ? 'islands-panel__voyage islands-panel__voyage--ready'
              : 'islands-panel__voyage'
          }
          aria-hidden={!selectedIsland}
        >
          <button
            type="button"
            className="islands-panel__set-sail"
            onClick={onSetSail}
            disabled={!selectedIsland}
          >
            <Cartouche />
            <span className="islands-panel__set-sail-label">{WORLD_MAP_COPY.setSail}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
