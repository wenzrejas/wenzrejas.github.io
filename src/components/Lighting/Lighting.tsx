import { useRef } from 'react'
import { useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { useDebug } from '../Debug/DebugControls'
import { IS_DEBUG } from '../Experience/constants'

export default function Lighting() {
  const { lighting } = useDebug()
  const { hemiSky, hemiGround, hemiIntensity, sunX, sunY, sunZ, sunIntensity, sunColor } = lighting

  const sunRef = useRef<THREE.DirectionalLight>(null)
  useHelper(
    IS_DEBUG && (sunRef as React.RefObject<THREE.Object3D>),
    THREE.DirectionalLightHelper,
    10,
    '#ffe8b0'
  )

  return (
    <>
      <hemisphereLight color={hemiSky} groundColor={hemiGround} intensity={hemiIntensity} />
      <directionalLight
        ref={sunRef}
        position={[sunX, sunY, sunZ]}
        intensity={sunIntensity}
        color={sunColor}
      />
    </>
  )
}
