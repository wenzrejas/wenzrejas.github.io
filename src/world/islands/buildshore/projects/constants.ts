import type { ProjectKey } from '@/store/panelStore'
import { AMBER_GLOW_MATERIAL } from './qoves/constants'
import { INSET_GLOW_MATERIAL } from './uiux-works/constants'

// ── Sites ─────────────────────────────────────────────────────────────────────
export const PROJECT_LANDMARK_NODES: Record<ProjectKey, string[]> = {
  beeSigned: ['BeeSigned | Signing parchment monument'],
  chooChooChain: ['ChooChooChain_Station_Root'],
  paymentsManager: ['PaymentsManager_Terminal_Root'],
  uiuxWorks: ['UIUX_Works_Gem'],
  gelify: ['GEL_Angular_Root', 'GEL_Editor_Root'],
  qoves: ['Qoves_Logo_Root'],
}

export const PROJECT_MARKER_ANCHORS: Record<ProjectKey, string> = {
  beeSigned: 'BeeSigned_Marker_Anchor',
  chooChooChain: 'ChooChooChain_Marker_Anchor',
  paymentsManager: 'PaymentsManager_Marker_Anchor',
  uiuxWorks: 'UIUX_Works_Marker_Anchor',
  gelify: 'GEL_Marker_Anchor',
  qoves: 'Qoves_Marker_Anchor',
}

export const PROJECT_TOUCH_SPOTS: Partial<Record<ProjectKey, string>> = {
  qoves: 'Qoves_Waterfall_03_Central_Sea_Cascade',
}
export const TOUCH_SPOT_RADIUS = 2.5

export const PROJECT_MARKER_HEIGHT = 0.5
export const SHORE_RAYS_PER_SECTOR = 3

// ── Hovers (seconds) ──────────────────────────────────────────────────────────
export const PROJECT_HOVER_RELEASE_SECONDS = 0.5
export const PROJECT_HOVER_FULL_SECONDS = 6
export const PROJECT_HOVER_GLOW_MATERIALS = [INSET_GLOW_MATERIAL, AMBER_GLOW_MATERIAL]
