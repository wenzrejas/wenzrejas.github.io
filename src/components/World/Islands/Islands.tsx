import { useState } from 'react'
import * as THREE from 'three'
import { WORLD_LOCATIONS, type IslandConfig, type IslandKey } from './constants'

const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.BackSide })

interface IslandProps {
  islandKey: IslandKey
  position: readonly [number, number, number]
  radius: number
  color: string
  onSelect: (key: IslandKey) => void
}

function Island({ islandKey, position, radius, color, onSelect }: IslandProps) {
  const [hovered, setHovered] = useState(false)
  const [x, , z] = position
  const markerHeight = radius * 0.4

  return (
    <group
      position={[x, -3, z]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(islandKey)
      }}
    >
      {/* Inverted-hull outline — rendered only on hover */}
      {hovered && (
        <>
          <mesh scale={1.06} material={OUTLINE_MAT}>
            <cylinderGeometry args={[radius, radius * 1.15, 6, 32]} />
          </mesh>
          <mesh position={[0, 3.5, 0]} scale={1.1} material={OUTLINE_MAT}>
            <cylinderGeometry args={[radius * 0.75, radius * 0.9, 1.5, 32]} />
          </mesh>
        </>
      )}

      {/* Sandy base */}
      <mesh>
        <cylinderGeometry args={[radius, radius * 1.15, 6, 32]} />
        <meshStandardMaterial color="#c8a870" />
      </mesh>

      {/* Green cap (vegetation) */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[radius * 0.75, radius * 0.9, 1.5, 32]} />
        <meshStandardMaterial color="#5a9e4a" />
      </mesh>

      {/* Placeholder landmark marker */}
      <mesh position={[0, 4 + markerHeight / 2, 0]}>
        <boxGeometry args={[radius * 0.2, markerHeight, radius * 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Marker cap */}
      <mesh position={[0, 4 + markerHeight + radius * 0.1, 0]}>
        <sphereGeometry args={[radius * 0.12, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
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
        <Island
          key={key}
          islandKey={key}
          position={config.position}
          radius={config.radius}
          color={config.color}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
