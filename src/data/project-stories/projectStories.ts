import type { ProjectKey } from '@/store/panelStore'
import { BEE_SIGNED_STORY } from './beeSigned'
import { CHOO_CHOO_CHAIN_STORY } from './chooChooChain'
import { GELIFY_STORY } from './gelify'
import { PAYMENTS_MANAGER_STORY } from './paymentsManager'
import { QOVES_STORY } from './qoves'
import type { ProjectStory } from './types'
import { UIUX_WORKS_STORY } from './uiuxWorks'

export const PROJECT_STORIES: Record<ProjectKey, ProjectStory> = {
  beeSigned: BEE_SIGNED_STORY,
  chooChooChain: CHOO_CHOO_CHAIN_STORY,
  paymentsManager: PAYMENTS_MANAGER_STORY,
  uiuxWorks: UIUX_WORKS_STORY,
  gelify: GELIFY_STORY,
  qoves: QOVES_STORY,
}
