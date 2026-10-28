import type { ComponentType } from 'react'
import { ISLAND_COPY, PROJECT_COPY } from '@/data/islandCopy'
import { TOOLKIT_COPY } from '@/data/panelCopy'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import type { GroveKey, PanelKey, ProjectKey } from '@/store/panelStore'
import { CONTACT_SPLASH_URL } from './contact/constants'
import ContactContent from './contact/ContactContent'
import { PROJECT_SPLASH_URL } from './project/constants'
import SettingsContent from './settings/SettingsContent'
import { SUPPORT_SPLASH_URL } from './support/constants'
import SupportContent from './support/SupportContent'
import ToolkitContent from './toolkit/ToolkitContent'

interface PanelSpec {
  title: string
  subtitle: string
  splashUrl?: string
  isCentered?: boolean
  Content: ComponentType
}

const groveSpec = (grove: GroveKey): PanelSpec => ({
  title: TOOLKIT_COPY.groves[grove].title,
  subtitle: TOOLKIT_COPY.groves[grove].tagline,
  splashUrl: TOOLKIT_COPY.groves[grove].splash,
  Content: () => <ToolkitContent grove={grove} />,
})

const projectSpec = (project: ProjectKey): PanelSpec => ({
  title: PROJECT_COPY[project],
  subtitle: ISLAND_COPY.buildshore.description,
  splashUrl: PROJECT_SPLASH_URL,
  Content: () => null,
})

export const PANEL_SPECS: Record<PanelKey, PanelSpec> = {
  contact: {
    title: ISLAND_COPY.lumina.label,
    subtitle: ISLAND_COPY.lumina.description,
    splashUrl: CONTACT_SPLASH_URL,
    Content: ContactContent,
  },
  support: {
    title: ISLAND_COPY.cozy.label,
    subtitle: ISLAND_COPY.cozy.description,
    splashUrl: SUPPORT_SPLASH_URL,
    Content: SupportContent,
  },
  settings: {
    title: SETTINGS_COPY.title,
    subtitle: SETTINGS_COPY.subtitle,
    isCentered: true,
    Content: SettingsContent,
  },
  frontend: groveSpec('frontend'),
  creative: groveSpec('creative'),
  visuals: groveSpec('visuals'),
  design: groveSpec('design'),
  beeSigned: projectSpec('beeSigned'),
  chooChooChain: projectSpec('chooChooChain'),
  paymentsManager: projectSpec('paymentsManager'),
  uiuxWorks: projectSpec('uiuxWorks'),
  gelify: projectSpec('gelify'),
  qoves: projectSpec('qoves'),
}
