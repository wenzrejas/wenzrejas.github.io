import { useLayoutEffect, useMemo } from 'react'
import { Shadow, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useDebugStore } from '../../../../store/debugStore'
import { applyCloudShadow } from '../../../../utils/cloudShadow'
import { OUTLINE_MAT } from '../outlineMaterial'
import type { IslandBodyProps } from '../types'
import {
  BLOB_COLOR,
  BLOB_OPACITY,
  BLOB_SPREAD,
  BLOB_Y,
  BOAT_NODE,
  BODY_NODE,
  COZY_MODEL_URL,
  FIRE_NODES,
} from './constants'
import { useBoatBob } from './useBoatBob'
import { isFireMaterial, useNightGlow, type GlowTarget } from './useNightGlow'
import CampfireEmbers from './CampfireEmbers'
import CampfireFlames from './CampfireFlames'

const Y_AXIS = new THREE.Vector3(0, 1, 0)

type TintTarget = { mat: THREE.MeshStandardMaterial; base: THREE.Color }
type FireSpot = {
  origin: THREE.Vector3
  base: THREE.Vector3
  width: number
  height: number
}

export default function CozyIsle({ config, hovered }: IslandBodyProps) {
  const { scene } = useGLTF(COZY_MODEL_URL)
  const {
    scale: scaleMult,
    rotation,
    offsetX,
    offsetY,
    offsetZ,
    brightness,
  } = useDebugStore((s) => s.island)

  const { model, outline, boat, fire, footprint, center, tints, glows } = useMemo(() => {
    const model = scene.clone(true)
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const tints: TintTarget[] = []
    const glows: GlowTarget[] = []
    const cache = new Map<THREE.Material, THREE.Material>()
    const flatten = (m: THREE.Material): THREE.Material => {
      const cached = cache.get(m)
      if (cached) return cached
      const mat = m.clone() as THREE.MeshPhysicalMaterial
      if ('roughness' in mat) mat.roughness = 1
      if ('specularIntensity' in mat) mat.specularIntensity = 0
      if ('color' in mat) tints.push({ mat, base: mat.color.clone() })
      if ('emissive' in mat && mat.emissive.getHex() !== 0) {
        glows.push({ mat, base: mat.emissiveIntensity, fire: isFireMaterial(mat.name) })
      }
      applyCloudShadow(mat)
      cache.set(m, mat)
      return mat
    }
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(flatten)
        : flatten(mesh.material)
    })

    const body = model.getObjectByName(BODY_NODE)
    let outline: THREE.Object3D | null = null
    if (body) {
      outline = body.clone(true)
      outline.scale.multiplyScalar(1.03)
      outline.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.material = OUTLINE_MAT
      })
    }

    const boat = model.getObjectByName(BOAT_NODE) ?? null

    const fireBox = new THREE.Box3()
    for (const name of FIRE_NODES) {
      const node = model.getObjectByName(name)
      if (node) fireBox.expandByObject(node)
    }

    let fire: FireSpot | null = null
    if (!fireBox.isEmpty()) {
      const fireSize = fireBox.getSize(new THREE.Vector3())
      const fireCenter = fireBox.getCenter(new THREE.Vector3())
      fire = {
        origin: new THREE.Vector3(fireCenter.x, fireBox.max.y, fireCenter.z),
        base: new THREE.Vector3(fireCenter.x, fireBox.min.y, fireCenter.z),
        width: Math.max(fireSize.x, fireSize.z),
        height: fireSize.y,
      }
    }

    return {
      model,
      outline,
      boat,
      fire,
      footprint: Math.max(size.x, size.z),
      center,
      tints,
      glows,
    }
  }, [scene])

  useLayoutEffect(() => {
    for (const { mat, base } of tints) mat.color.copy(base).multiplyScalar(brightness)
  }, [tints, brightness])

  useBoatBob(boat)
  useNightGlow(glows)

  const scale = (config.radius * 2 * scaleMult) / footprint
  const facing = THREE.MathUtils.degToRad(rotation)
  const recentre = new THREE.Vector3(center.x, 0, center.z)
    .applyAxisAngle(Y_AXIS, facing)
    .multiplyScalar(-scale)

  return (
    <>
      <Shadow
        position={[offsetX, BLOB_Y, offsetZ]}
        scale={config.radius * 2 * scaleMult * BLOB_SPREAD}
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
        {fire && (
          <>
            <CampfireFlames base={fire.base} height={fire.height} islandScale={scale} />
            <CampfireEmbers
              origin={fire.origin}
              width={fire.width}
              height={fire.height}
              islandScale={scale}
            />
          </>
        )}
      </group>
    </>
  )
}
