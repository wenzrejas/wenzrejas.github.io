import { OUTLINE_MAT } from '../outlineMaterial'
import type { IslandBodyProps } from '../types'

const SINK_Y = -3

export default function PlaceholderIsland({ config, hovered }: IslandBodyProps) {
  const { radius, color } = config
  const markerHeight = radius * 0.4

  return (
    <group position-y={SINK_Y}>
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

      <mesh>
        <cylinderGeometry args={[radius, radius * 1.15, 6, 32]} />
        <meshStandardMaterial color="#c8a870" />
      </mesh>

      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[radius * 0.75, radius * 0.9, 1.5, 32]} />
        <meshStandardMaterial color="#5a9e4a" />
      </mesh>

      <mesh position={[0, 4 + markerHeight / 2, 0]}>
        <boxGeometry args={[radius * 0.2, markerHeight, radius * 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, 4 + markerHeight + radius * 0.1, 0]}>
        <sphereGeometry args={[radius * 0.12, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}
