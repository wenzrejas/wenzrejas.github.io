import { useRef, type ComponentType } from 'react'
import type * as THREE from 'three'
import { WORLD_LOCATIONS, type IslandConfig, type IslandKey } from './shared/constants'
import type { IslandBodyProps } from './shared/types'
import CozyIsle from './cozy-isle/CozyIsle'
import LuminaPoint from './lumina-point/LuminaPoint'
import PlaceholderIsland from './placeholder-island/PlaceholderIsland'
import TechGrove from './tech-grove/TechGrove'
import TimewellDepth from './timewell-depth/TimewellDepth'
import { useNearViewport } from './shared/useNearViewport'

const ISLAND_BODIES: Partial<Record<IslandKey, ComponentType<IslandBodyProps>>> = {
  timewell: TimewellDepth,
  cozy: CozyIsle,
  lumina: LuminaPoint,
  tech: TechGrove,
}

interface IslandProps {
  islandKey: IslandKey
  config: IslandConfig
}

function Island({ islandKey, config }: IslandProps) {
  const [x, , z] = config.position
  const Body = ISLAND_BODIES[islandKey] ?? PlaceholderIsland

  const groupRef = useRef<THREE.Group>(null)
  useNearViewport(groupRef, islandKey)

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      <Body islandKey={islandKey} config={config} />
    </group>
  )
}

export default function Islands() {
  return (
    <>
      {(Object.entries(WORLD_LOCATIONS) as [IslandKey, IslandConfig][]).map(([key, config]) => (
        <Island key={key} islandKey={key} config={config} />
      ))}
    </>
  )
}
