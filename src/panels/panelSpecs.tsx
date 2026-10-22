import type { ComponentType } from 'react'
import { ISLAND_COPY, PROJECT_COPY } from '@/data/islandCopy'
import { TOOLKIT_COPY } from '@/data/panelCopy'
import type { GroveKey, PanelKey, ProjectKey } from '@/store/panelStore'
import { CONTACT_SPLASH_URL } from './contact/constants'
import ContactContent from './contact/ContactContent'
import { PROJECT_SPLASH_URL } from './project/constants'
import { SUPPORT_SPLASH_URL } from './support/constants'
import SupportContent from './support/SupportContent'
import { TOOLKIT_SPLASH_URL } from './toolkit/constants'
import ToolkitContent from './toolkit/ToolkitContent'

interface PanelSpec {
  title: string
  subtitle: string
  splashUrl?: string
  Content: ComponentType
}

const groveSpec = (grove: GroveKey): PanelSpec => ({
  title: TOOLKIT_COPY.groves[grove].title,
  subtitle: TOOLKIT_COPY.groves[grove].tagline,
  splashUrl: TOOLKIT_SPLASH_URL,
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
