import { useEffect, useId, useRef, type CSSProperties } from 'react'
import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import CloseButton from '@/panels/shared/close-button/CloseButton'
import { useMistScroll } from '@/panels/shared/island-panel/useMistScroll'
import { isMotionReduced } from '@/store/settingsStore'
import type { IslandKey } from '@/world/islands/shared/constants'
import type { MapMotion } from '../types'
import CompassNeedle from './CompassNeedle'
import { ISLAND_LIST_ORDER, MAP_SCROLL_URL, PANEL_FLAG_URL, PANEL_ROPE_URL } from './constants'
import IslandCard from './IslandCard'
import './IslandsPanel.scss'

interface IslandsPanelProps {
  selectedIsland: IslandKey | null
  motion: MapMotion | null
  onSelect: (island: IslandKey) => void
  onClose: () => void
}

const entryStyle = (index: number) => ({ '--entry-index': index }) as CSSProperties

export default function IslandsPanel({
  selectedIsland,
  motion,
  onSelect,
  onClose,
}: IslandsPanelProps) {
  const headingId = useId()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const mistStyle = useMistScroll(scrollerRef)

  useEffect(() => {
    if (!selectedIsland) return
    scrollerRef.current?.querySelector('.island-card--selected')?.scrollIntoView({
      block: 'nearest',
      behavior: isMotionReduced() ? 'auto' : 'smooth',
    })
  }, [selectedIsland])

  return (
    <aside
      className={motion ? `islands-panel islands-panel--${motion}` : 'islands-panel'}
      aria-labelledby={headingId}
    >
      <img className="islands-panel__flag" src={PANEL_FLAG_URL} alt="" draggable={false} />
      <img className="islands-panel__rope" src={PANEL_ROPE_URL} alt="" draggable={false} />
      <CloseButton
        className="islands-panel__close"
        label={WORLD_MAP_COPY.close}
        onClose={onClose}
      />
      <div className="islands-panel__content">
        <div className="islands-panel__header">
          <img className="islands-panel__icon" src={MAP_SCROLL_URL} alt="" draggable={false} />
          <h2 id={headingId} className="islands-panel__heading">
            {WORLD_MAP_COPY.islandsHeading}
          </h2>
        </div>
        <div className="islands-panel__rule" />
        <div ref={scrollerRef} className="islands-panel__scroller" style={mistStyle}>
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
            {selectedIsland && <CompassNeedle pointedIsland={selectedIsland} />}
          </ul>
        </div>
      </div>
    </aside>
  )
}
