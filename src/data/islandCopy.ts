import type { IslandKey } from '@/world/islands/shared/constants'
import type { MonolithName } from '@/world/islands/lumina-point/constants'
import type { ProjectKey } from '@/store/panelStore'

interface IslandCopy {
  label: string
  description: string
  marker?: string
}

export const ISLAND_COPY = {
  timewell: {
    label: 'Timewell Depth',
    description: 'Experience & Journey',
    marker: 'Explore Depths',
  },
  cozy: {
    label: 'Cozy Isle',
    description: 'Coffee & Support',
    marker: 'Take a Break',
  },
  lumina: {
    label: 'Lumina Point',
    description: 'Contact & Connect',
    marker: 'Send a Signal',
  },
  buildshore: {
    label: 'Buildshore',
    description: 'Projects & Works',
  },
  tech: {
    label: 'Tech Grove',
    description: 'Skills & Technologies',
    marker: 'View Toolkit',
  },
} satisfies Record<IslandKey, IslandCopy>

export const MONOLITH_COPY: Record<MonolithName, string> = {
  Document: 'Resume',
  Email: 'Email',
  GitHub: 'GitHub',
  LinkedIn: 'LinkedIn',
}

export const PROJECT_COPY: Record<ProjectKey, string> = {
  beeSigned: 'BeeSigned',
  chooChooChain: 'Choo Choo Chain',
  paymentsManager: 'Payments Manager +',
  uiuxWorks: 'UI/UX Works',
  gelify: 'Gelify',
  qoves: 'Qoves',
}

export const PROJECT_MARKER_DESCRIPTIONS: Record<ProjectKey, string> = {
  beeSigned: 'An e-signature app for Australian businesses',
  chooChooChain: 'A 3D arcade game built for Three.js Journey',
  paymentsManager: 'A billing and payments app for businesses',
  uiuxWorks: 'Interfaces I designed, from wireframe to final screen',
  gelify: "Engagis's Angular framework and template builder",
  qoves: 'A facial aesthetics platform and member portal',
}

export const DESIGN_CANVAS_COPY = {
  layerName: 'Gem',
  layerSize: '120 × 160',
}
