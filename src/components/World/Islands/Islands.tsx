import { useRef, type ComponentType } from 'react'
import type * as THREE from 'three'
import { WORLD_LOCATIONS, type IslandConfig, type IslandKey } from './constants'
import type { IslandBodyProps } from './types'
import CozyIsle from './CozyIsle/CozyIsle'
import LuminaPoint from './LuminaPoint/LuminaPoint'
import PlaceholderIsland from './PlaceholderIsland/PlaceholderIsland'
import TechGrove from './TechGrove/TechGrove'
import TimewellDepth from './TimewellDepth/TimewellDepth'
import { useNearViewport } from './useNearViewport'

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
