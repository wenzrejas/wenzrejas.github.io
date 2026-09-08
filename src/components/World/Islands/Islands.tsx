import { useState, type ComponentType } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { ISLAND_INTERACTION, WORLD_LOCATIONS, type IslandConfig, type IslandKey } from './constants'
import type { IslandBodyProps } from './types'
import CozyIsle from './CozyIsle/CozyIsle'
import PlaceholderIsland from './PlaceholderIsland/PlaceholderIsland'

const ISLAND_BODIES: Partial<Record<IslandKey, ComponentType<IslandBodyProps>>> = {
  cozy: CozyIsle,
}

interface IslandProps {
  islandKey: IslandKey
  config: IslandConfig
  onSelect: (key: IslandKey) => void
}

function Island({ islandKey, config, onSelect }: IslandProps) {
  const [hovered, setHovered] = useState(false)
  const [x, , z] = config.position
  const Body = ISLAND_BODIES[islandKey] ?? PlaceholderIsland

  const interaction = ISLAND_INTERACTION
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          setHovered(false)
          document.body.style.cursor = ''
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onSelect(islandKey)
        },
      }
    : {}

  return (
    <group position={[x, 0, z]} {...interaction}>
      <Body config={config} hovered={hovered} />
    </group>
  )
}

interface IslandsProps {
  onSelect: (key: IslandKey) => void
}

export default function Islands({ onSelect }: IslandsProps) {
  return (
    <>
      {(Object.entries(WORLD_LOCATIONS) as [IslandKey, IslandConfig][]).map(([key, config]) => (
        <Island key={key} islandKey={key} config={config} onSelect={onSelect} />
      ))}
    </>
  )
}
