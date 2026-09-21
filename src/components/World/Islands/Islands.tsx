import { useRef, useState, type ComponentType } from 'react'
import type * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { ISLAND_INTERACTION, WORLD_LOCATIONS, type IslandConfig, type IslandKey } from './constants'
import type { IslandBodyProps } from './types'
import CozyIsle from './CozyIsle/CozyIsle'
import LuminaPoint from './LuminaPoint/LuminaPoint'
import PlaceholderIsland from './PlaceholderIsland/PlaceholderIsland'
import TechGrove from './TechGrove/TechGrove'
import { useNearViewport } from './useNearViewport'

const ISLAND_BODIES: Partial<Record<IslandKey, ComponentType<IslandBodyProps>>> = {
  cozy: CozyIsle,
  lumina: LuminaPoint,
  tech: TechGrove,
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

  const groupRef = useRef<THREE.Group>(null)
  useNearViewport(groupRef, islandKey)

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
    <group ref={groupRef} position={[x, 0, z]} {...interaction}>
      <Body islandKey={islandKey} config={config} hovered={hovered} />
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
