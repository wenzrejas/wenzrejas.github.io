import { useLayoutEffect, useMemo, useState } from 'react'
import { Shadow, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { ISLAND_INTERACTION, WORLD_LOCATIONS, type IslandConfig, type IslandKey } from './constants'
import { useDebugStore } from '../../../store/debugStore'
import { applyCloudShadow } from '../../../utils/cloudShadow'

const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.BackSide })

const MODEL_BODY_NODE = 'CozyIsle_Static'
const Y_AXIS = new THREE.Vector3(0, 1, 0)

const BLOB_SPREAD = 1.25
const BLOB_Y = 0.05
const BLOB_COLOR = '#0b3a52'
const BLOB_OPACITY = 0.38

type TintTarget = { mat: THREE.MeshStandardMaterial; base: THREE.Color }

interface IslandModelProps {
  url: string
  radius: number
  hovered: boolean
}

function IslandModel({ url, radius, hovered }: IslandModelProps) {
  const { scene } = useGLTF(url)
  const {
    scale: scaleMult,
    rotation,
    offsetX,
    offsetY,
    offsetZ,
    brightness,
  } = useDebugStore((s) => s.island)

  const { model, outline, footprint, center, tints } = useMemo(() => {
    const model = scene.clone(true)
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const tints: TintTarget[] = []
    const cache = new Map<THREE.Material, THREE.Material>()
    const flatten = (m: THREE.Material): THREE.Material => {
      const cached = cache.get(m)
      if (cached) return cached
      const mat = m.clone() as THREE.MeshPhysicalMaterial
      if ('roughness' in mat) mat.roughness = 1
      if ('specularIntensity' in mat) mat.specularIntensity = 0
      if ('color' in mat) tints.push({ mat, base: mat.color.clone() })
      applyCloudShadow(mat)
      cache.set(m, mat)
      return mat
    }
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(flatten)
        : flatten(mesh.material)
    })

    const body = model.getObjectByName(MODEL_BODY_NODE)
    let outline: THREE.Object3D | null = null
    if (body) {
      outline = body.clone(true)
      outline.scale.multiplyScalar(1.03)
      outline.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.material = OUTLINE_MAT
        mesh.castShadow = false
      })
    }

    return { model, outline, footprint: Math.max(size.x, size.z), center, tints }
  }, [scene])

  useLayoutEffect(() => {
    for (const { mat, base } of tints) mat.color.copy(base).multiplyScalar(brightness)
  }, [tints, brightness])

  const scale = (radius * 2 * scaleMult) / footprint
  const facing = THREE.MathUtils.degToRad(rotation)
  const recentre = new THREE.Vector3(center.x, 0, center.z)
    .applyAxisAngle(Y_AXIS, facing)
    .multiplyScalar(-scale)

  return (
    <>
      <Shadow
        position={[offsetX, BLOB_Y, offsetZ]}
        scale={radius * 2 * scaleMult * BLOB_SPREAD}
        color={BLOB_COLOR}
        opacity={BLOB_OPACITY}
        renderOrder={2}
      />
      <group
        position={[recentre.x + offsetX, offsetY, recentre.z + offsetZ]}
        rotation-y={facing}
        scale={scale}
      >
        {hovered && outline && <primitive object={outline} />}
        <primitive object={model} />
      </group>
    </>
  )
}

interface IslandProps {
  islandKey: IslandKey
  position: readonly [number, number, number]
  radius: number
  color: string
  model?: string
  onSelect: (key: IslandKey) => void
}

interface PlaceholderIslandProps {
  radius: number
  color: string
  hovered: boolean
}

function PlaceholderIsland({ radius, color, hovered }: PlaceholderIslandProps) {
  const markerHeight = radius * 0.4

  return (
    <>
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

      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.15, 6, 32]} />
        <meshStandardMaterial color="#c8a870" />
      </mesh>

      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.75, radius * 0.9, 1.5, 32]} />
        <meshStandardMaterial color="#5a9e4a" />
      </mesh>

      <mesh position={[0, 4 + markerHeight / 2, 0]} castShadow>
        <boxGeometry args={[radius * 0.2, markerHeight, radius * 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[0, 4 + markerHeight + radius * 0.1, 0]}>
        <sphereGeometry args={[radius * 0.12, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </>
  )
}

function Island({ islandKey, position, radius, color, model, onSelect }: IslandProps) {
  const [hovered, setHovered] = useState(false)
  const [x, , z] = position

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
    <group position={[x, model ? 0 : -3, z]} {...interaction}>
      {model ? (
        <IslandModel url={model} radius={radius} hovered={hovered} />
      ) : (
        <PlaceholderIsland radius={radius} color={color} hovered={hovered} />
      )}
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
          model={'model' in config ? config.model : undefined}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
