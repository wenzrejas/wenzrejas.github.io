import { useRef } from 'react'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import { scrollBehavior } from '@/store/settingsStore'
import { useDragToScroll } from '../shared/drag-to-scroll/useDragToScroll'
import { TAB_REVEAL, type SettingsTab } from './constants'

interface SettingsTabsProps {
  tabs: readonly SettingsTab[]
  activeTab: SettingsTab
  paneId: string
  onSelect: (tab: SettingsTab) => void
}

export default function SettingsTabs({ tabs, activeTab, paneId, onSelect }: SettingsTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const { isDragging, dragHandlers } = useDragToScroll(rowRef)

  return (
    <div
      ref={rowRef}
      className={isDragging ? 'settings__tabs settings__tabs--dragging' : 'settings__tabs'}
      role="tablist"
      aria-label={SETTINGS_COPY.title}
      {...dragHandlers}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          className="settings__tab"
          aria-selected={tab === activeTab}
          aria-controls={paneId}
          onClick={(event) => {
            onSelect(tab)
            event.currentTarget.scrollIntoView({ ...TAB_REVEAL, behavior: scrollBehavior() })
          }}
        >
          {SETTINGS_COPY[tab].tab}
        </button>
      ))}
    </div>
  )
}
