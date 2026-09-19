import { useMemo } from 'react'
import * as THREE from 'three'
import { useDebugStore } from '../../../../store/debugStore'
import { OUTLINE_MAT } from '../outlineMaterial'
import type { IslandBodyProps } from '../types'

const SINK_Y = -3
const SAND = '#c8a870'
const GRASS = '#5a9e4a'

export default function PlaceholderIsland({ islandKey, config, hovered }: IslandBodyProps) {
  const { radius, color } = config
  const { scale, rotation, offsetX, offsetY, offsetZ, brightness } = useDebugStore(
    (s) => s.islands[islandKey]
  )

  const { sand, grass, marker } = useMemo(
    () => ({
      sand: new THREE.Color(SAND).multiplyScalar(brightness),
      grass: new THREE.Color(GRASS).multiplyScalar(brightness),
      marker: new THREE.Color(color).multiplyScalar(brightness),
    }),
    [color, brightness]
  )

  const markerHeight = radius * 0.4

  return (
    <group
      position={[offsetX, SINK_Y + offsetY, offsetZ]}
      rotation-y={THREE.MathUtils.degToRad(rotation)}
      scale={scale}
    >
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
        <meshStandardMaterial color={sand} />
      </mesh>

      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[radius * 0.75, radius * 0.9, 1.5, 32]} />
        <meshStandardMaterial color={grass} />
      </mesh>

      <mesh position={[0, 4 + markerHeight / 2, 0]}>
        <boxGeometry args={[radius * 0.2, markerHeight, radius * 0.2]} />
        <meshStandardMaterial color={marker} />
      </mesh>

      <mesh position={[0, 4 + markerHeight + radius * 0.1, 0]}>
        <sphereGeometry args={[radius * 0.12, 12, 12]} />
        <meshStandardMaterial color={marker} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}
