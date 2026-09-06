import { forwardRef, useRef } from 'react'
import * as THREE from 'three'
import { FOAM_PLANE_SIZE } from './constants'
import { useDebugStore } from '../../../store/debugStore'
import { useShipModel } from './useShipModel'
import { useShipMovement } from './useShipMovement'
import { useHullFoam } from './useHullFoam'

const Ship = forwardRef<THREE.Group>((_props, ref) => {
  const { modelSize, baseY } = useDebugStore((s) => s.ship)
  const { clonedScene, footprint } = useShipModel()

  const groupRef = useRef<THREE.Group>(null)
  const heading = useShipMovement(groupRef)
  const { meshRef: foamMeshRef, material: foamMaterial } = useHullFoam(groupRef, heading)

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
        <primitive object={clonedScene} scale={modelSize / footprint} />
      </group>

      <mesh ref={foamMeshRef} material={foamMaterial} renderOrder={3} frustumCulled={false}>
        <planeGeometry args={[FOAM_PLANE_SIZE, FOAM_PLANE_SIZE]} />
      </mesh>
    </>
  )
})

Ship.displayName = 'Ship'
export default Ship
