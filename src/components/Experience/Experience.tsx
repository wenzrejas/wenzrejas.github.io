import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA_OFFSET, IS_DEBUG } from './constants'
import Lighting from '../Lighting/Lighting'
import Ocean from '../Ocean/Ocean'
import Ship from '../Ship/Ship'
import WakeTrail from '../Ship/WakeTrail'
import WakeRipples from '../Ship/WakeRipples'

function CameraRig({ shipRef }: { shipRef: React.RefObject<THREE.Mesh | null> }) {
  useFrame(({ camera }) => {
    if (!shipRef.current) return
    const { x, y, z } = shipRef.current.position
    camera.position.set(x + CAMERA_OFFSET[0], y + CAMERA_OFFSET[1], z + CAMERA_OFFSET[2])
    camera.lookAt(x, y, z)
  })
  return null
}

export default function Experience() {
  const shipRef = useRef<THREE.Mesh>(null)

  return (
    <Canvas
      orthographic
      camera={{ zoom: 5, position: CAMERA_OFFSET, near: 0.1, far: 10000 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a7fa8']} />
      {IS_DEBUG
        ? <OrbitControls />
        : <CameraRig shipRef={shipRef} />
      }
      <Lighting />
      <Ocean />
      <Ship ref={shipRef} />
      <WakeTrail shipRef={shipRef} />
      <WakeRipples shipRef={shipRef} />
    </Canvas>
  )
}
