import { SETTINGS_COPY } from '@/data/settingsCopy'
import type { SettingsTab } from './constants'

interface SettingsTabsProps {
  tabs: readonly SettingsTab[]
  activeTab: SettingsTab
  paneId: string
  onSelect: (tab: SettingsTab) => void
}

export default function SettingsTabs({ tabs, activeTab, paneId, onSelect }: SettingsTabsProps) {
  return (
    <div className="settings__tabs" role="tablist" aria-label={SETTINGS_COPY.title}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          className="settings__tab"
          aria-selected={tab === activeTab}
          aria-controls={paneId}
          onClick={() => onSelect(tab)}
        >
          {SETTINGS_COPY[tab].tab}
        </button>
      ))}
    </div>
  )
}
