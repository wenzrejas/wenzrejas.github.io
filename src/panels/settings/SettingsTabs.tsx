import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import { scrollBehavior } from '@/store/settingsStore'
import { useDragToScroll } from '../shared/drag-to-scroll/useDragToScroll'
import PanelIcon from '../shared/PanelIcon'
import { useScrollEdges } from '../shared/scroll-edges/useScrollEdges'
import {
  TAB_CARET_SCROLL_SHARE,
  TAB_CARET_STEPS,
  TAB_EDGE_SLACK_PIXELS,
  TAB_REVEAL,
  type SettingsTab,
} from './constants'
import { tabPositionAfterKey } from './tabKeys'

interface SettingsTabsProps {
  tabs: readonly SettingsTab[]
  activeTab: SettingsTab
  paneId: string
  onSelect: (tab: SettingsTab) => void
}

type CaretDirection = keyof typeof TAB_CARET_STEPS

const CARET_DIRECTIONS = Object.keys(TAB_CARET_STEPS) as CaretDirection[]

const revealTab = (tab: HTMLElement) =>
  tab.scrollIntoView({ ...TAB_REVEAL, behavior: scrollBehavior() })

const keepFocusInPlace = (event: PointerEvent) => event.preventDefault()

export default function SettingsTabs({ tabs, activeTab, paneId, onSelect }: SettingsTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const { isDragging, dragHandlers } = useDragToScroll(rowRef)
  const edges = useScrollEdges(rowRef, TAB_EDGE_SLACK_PIXELS)

  const moveByKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = tabPositionAfterKey(event.key, tabs.indexOf(activeTab), tabs.length)
    if (next === null) return
    event.preventDefault()
    onSelect(tabs[next])
    const tab = rowRef.current?.querySelectorAll('button')[next]
    if (!tab) return
    tab.focus({ preventScroll: true })
    revealTab(tab)
  }

  const scrollToward = (direction: CaretDirection) => {
    const row = rowRef.current
    if (!row) return
    const left = TAB_CARET_STEPS[direction] * row.clientWidth * TAB_CARET_SCROLL_SHARE
    row.scrollBy({ left, behavior: scrollBehavior() })
  }

  const stripClassName = [
    'settings__tab-strip',
    !edges.isAtStart && 'settings__tab-strip--more-previous',
    !edges.isAtEnd && 'settings__tab-strip--more-next',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={stripClassName}>
      <div
        ref={rowRef}
        className={isDragging ? 'settings__tabs settings__tabs--dragging' : 'settings__tabs'}
        role="tablist"
        aria-label={SETTINGS_COPY.title}
        onKeyDown={moveByKey}
        {...dragHandlers}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            className="settings__tab"
            tabIndex={tab === activeTab ? 0 : -1}
            aria-selected={tab === activeTab}
            aria-controls={paneId}
            onClick={(event) => {
              onSelect(tab)
              revealTab(event.currentTarget)
            }}
          >
            {SETTINGS_COPY[tab].tab}
          </button>
        ))}
      </div>
      {CARET_DIRECTIONS.map((direction) => (
        <button
          key={direction}
          type="button"
          className={`settings__tab-caret settings__tab-caret--${direction}`}
          tabIndex={-1}
          aria-hidden="true"
          onPointerDown={keepFocusInPlace}
          onClick={() => scrollToward(direction)}
        >
          <PanelIcon icon={direction} />
        </button>
      ))}
    </div>
  )
}
