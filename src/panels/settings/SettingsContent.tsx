import { useId, useState, type ComponentType } from 'react'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import { isWorldScene, useViewStore } from '@/store/viewStore'
import SettingsPane from './SettingsPane'
import SettingsTabs from './SettingsTabs'
import { SETTINGS_TABS, type SettingsTab } from './constants'
import AboutTab from './tabs/AboutTab'
import ControlsTab from './tabs/ControlsTab'
import DisplayTab from './tabs/DisplayTab'
import SoundTab from './tabs/SoundTab'
import WorldTab from './tabs/WorldTab'
import './SettingsContent.scss'

const TAB_PANES: Record<SettingsTab, ComponentType> = {
  sound: SoundTab,
  display: DisplayTab,
  world: WorldTab,
  controls: ControlsTab,
  achievements: () => null,
  about: AboutTab,
}

const BELOW_SURFACE_TABS = SETTINGS_TABS.filter((tab) => tab !== 'world')

export default function SettingsContent() {
  const isInWorld = useViewStore(isWorldScene)
  const [chosenTab, chooseTab] = useState<SettingsTab>(SETTINGS_TABS[0])
  const paneId = useId()

  const tabs: readonly SettingsTab[] = isInWorld ? SETTINGS_TABS : BELOW_SURFACE_TABS
  const activeTab = tabs.includes(chosenTab) ? chosenTab : tabs[0]
  const Pane = TAB_PANES[activeTab]

  return (
    <>
      <SettingsTabs tabs={tabs} activeTab={activeTab} paneId={paneId} onSelect={chooseTab} />
      <SettingsPane key={activeTab} id={paneId} label={SETTINGS_COPY[activeTab].tab}>
        <Pane />
      </SettingsPane>
    </>
  )
}
