import { useEffect, useMemo, type RefObject } from 'react'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { useDebugStore } from '@/store/debugStore'
import { traceHullOutline, type HullOutline } from './hullOutline'
import { useShipFade } from './shipFade'
import { useShipGlow } from './shipGlow'
import Slipstream from './Slipstream'
import { useHullFoam } from './useHullFoam'
import { useShipLivery } from './useShipLivery'
import { useShipModel } from './useShipModel'
import { useShipMovement } from './useShipMovement'
import { useShipRig } from './useShipRig'

interface ShipProps {
  shipRef: RefObject<THREE.Group | null>
  hullOutlineRef: RefObject<HullOutline | null>
}

export default function Ship({ shipRef, hullOutlineRef }: ShipProps) {
  const { modelSize, baseY, brightness } = useDebugStore((state) => state.ship)
  const { scene, clonedScene, footprint, rig, fadePass, glows } = useShipModel(brightness)
  const modelScale = modelSize / footprint
  const hullOutline = useMemo(
    () => traceHullOutline(scene, modelScale, baseY),
    [scene, modelScale, baseY]
  )

  const sailing = useShipMovement(shipRef)
  const {
    meshRef: foamRef,
    geometry: foamGeometry,
    material: foamMaterial,
  } = useHullFoam(shipRef, sailing, hullOutline)
  useShipRig(rig, sailing)
  useShipGlow(glows)
  useShipFade(fadePass)
  useShipLivery()

  useEffect(() => {
    hullOutlineRef.current = hullOutline
  }, [hullOutlineRef, hullOutline])

  return (
    <>
      <group ref={shipRef} position={[0, baseY, 0]}>
        <primitive object={clonedScene} scale={modelScale}>
          <Slipstream sailing={sailing} />
        </primitive>
      </group>

      {foamGeometry && (
        <mesh
          ref={foamRef}
          geometry={foamGeometry}
          material={foamMaterial}
          renderOrder={RENDER_LAYER.waterSurface}
          frustumCulled={false}
        />
      )}
    </>
  )
}
