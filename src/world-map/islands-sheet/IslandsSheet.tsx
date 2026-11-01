import { useRef, type ReactNode } from 'react'
import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import CloseButton from '@/panels/shared/close-button/CloseButton'
import { useMistScroll } from '@/panels/shared/island-panel/useMistScroll'
import type { IslandKey } from '@/world/islands/shared/constants'
import { ISLAND_LIST_ORDER, MAP_SCROLL_URL } from '../islands-panel/constants'
import IslandCard from '../islands-panel/IslandCard'
import type { MapMotion } from '../types'
import IslandDestination from './IslandDestination'
import './IslandsSheet.scss'

interface IslandsSheetProps {
  selectedIsland: IslandKey | null
  isListOpen: boolean
  motion: MapMotion | null
  onSelect: (island: IslandKey) => void
  onToggleList: () => void
  onSetSail: () => void
  onClose: () => void
}

function Fold({ isOpen, children }: { isOpen: boolean; children: ReactNode }) {
  return (
    <div
      className={isOpen ? 'islands-sheet__fold islands-sheet__fold--open' : 'islands-sheet__fold'}
      inert={!isOpen}
    >
      <div className="islands-sheet__fold-inner">{children}</div>
    </div>
  )
}

export default function IslandsSheet({
  selectedIsland,
  isListOpen,
  motion,
  onSelect,
  onToggleList,
  onSetSail,
  onClose,
}: IslandsSheetProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const mistStyle = useMistScroll(scrollerRef)

  const isOnDestination = selectedIsland !== null && !isListOpen
  const motionClass = (block: string) => (motion ? `${block} ${block}--${motion}` : block)
  const sheetClass = [
    motionClass('islands-sheet'),
    (isListOpen || isOnDestination) && 'islands-sheet--wide',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <CloseButton
        className={motionClass('islands-sheet-close')}
        label={WORLD_MAP_COPY.close}
        onClose={onClose}
      />
      <aside className={sheetClass} aria-label={WORLD_MAP_COPY.islandsHeading}>
        <Fold isOpen={!isOnDestination}>
          <button
            type="button"
            className="islands-sheet__toggle"
            aria-expanded={isListOpen}
            onClick={onToggleList}
          >
            <img className="islands-sheet__icon" src={MAP_SCROLL_URL} alt="" draggable={false} />
            <span className="islands-sheet__heading">{WORLD_MAP_COPY.islandsHeading}</span>
            <svg className="islands-sheet__caret" viewBox="0 0 12 8" aria-hidden="true">
              <path d="M1 6.5 L6 1.5 L11 6.5" />
            </svg>
          </button>
        </Fold>
        <Fold isOpen={isListOpen}>
          <div className="islands-sheet__rule" />
          <div ref={scrollerRef} className="islands-sheet__scroller" style={mistStyle}>
            <ul className="islands-sheet__list">
              {ISLAND_LIST_ORDER.map((island) => (
                <li key={island} className="islands-sheet__item">
                  <IslandCard
                    island={island}
                    isSelected={island === selectedIsland}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Fold>
        <Fold isOpen={isOnDestination}>
          {selectedIsland && (
            <IslandDestination
              island={selectedIsland}
              onSetSail={onSetSail}
              onOpenList={onToggleList}
            />
          )}
        </Fold>
      </aside>
    </>
  )
}
