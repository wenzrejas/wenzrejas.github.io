export const WORLD_LOCATIONS = {
  archipelago: {
    label: 'The Archipelago',
    description: 'Projects',
    position: [400, 0, 660] as [number, number, number],
    radius: 70,
    color: '#4a90d9',
  },
  sanctuary: {
    label: 'The Sanctuary',
    description: 'Tech Stack',
    position: [-360, 0, 530] as [number, number, number],
    radius: 55,
    color: '#5aab61',
  },
  beacon: {
    label: 'The Beacon',
    description: 'Contact',
    position: [760, 0, 60] as [number, number, number],
    radius: 45,
    color: '#e07b39',
  },
  whirlpool: {
    label: 'The Whirlpool',
    description: 'Experience',
    position: [0, 0, -600] as [number, number, number],
    radius: 80,
    color: '#9b59b6',
  },
  kofi: {
    label: 'Ko-fi Island',
    description: 'Support',
    position: [-720, 0, 170] as [number, number, number],
    radius: 30,
    color: '#f0a500',
  },
} as const

export type IslandKey = keyof typeof WORLD_LOCATIONS
export type IslandConfig = (typeof WORLD_LOCATIONS)[IslandKey]
