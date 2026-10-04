import type { IslandKey } from '@/world/islands/shared/constants'
import type { MonolithName } from '@/world/islands/lumina-point/constants'

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
    label: 'Buildshore Archipelago',
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
