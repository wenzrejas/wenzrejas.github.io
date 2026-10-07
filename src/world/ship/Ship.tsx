import { forwardRef, useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useDebugStore } from '@/store/debugStore'
import { useShipModel } from './useShipModel'
import { useShipMovement } from './useShipMovement'
import { useHullFoam } from './useHullFoam'
import { useShipRig } from './useShipRig'
import { useShipGlow } from './shipGlow'
import { traceHullOutline, type HullOutline } from './hullOutline'
import Slipstream from './Slipstream'

interface ShipProps {
  hullOutlineRef: RefObject<HullOutline | null>
}

const Ship = forwardRef<THREE.Group, ShipProps>(({ hullOutlineRef }, ref) => {
  const { modelSize, baseY, brightness } = useDebugStore((s) => s.ship)
  const { scene, clonedScene, footprint, rig, glows } = useShipModel(brightness)
  const modelScale = modelSize / footprint
  const hullOutline = useMemo(
    () => traceHullOutline(scene, modelScale, baseY),
    [scene, modelScale, baseY]
  )

  const groupRef = useRef<THREE.Group>(null)
  const { heading, lean, steering, tailwind } = useShipMovement(groupRef)
  const foam = useHullFoam(groupRef, heading, lean, hullOutline)
  useShipRig(rig, heading, steering, tailwind)
  useShipGlow(glows)

  useEffect(() => {
    hullOutlineRef.current = hullOutline
  }, [hullOutlineRef, hullOutline])

  return (
    <>
      <group
        ref={(el) => {
          groupRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        position={[0, baseY, 0]}
      >
        <primitive object={clonedScene} scale={modelScale}>
          <Slipstream tailwindRef={tailwind} />
        </primitive>
      </group>

      {foam.geometry && (
        <mesh
          ref={foam.meshRef}
          geometry={foam.geometry}
          material={foam.material}
          renderOrder={3}
          frustumCulled={false}
        />
      )}
    </>
  )
})

Ship.displayName = 'Ship'
export default Ship
