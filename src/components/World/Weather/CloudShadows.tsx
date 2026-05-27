import { useMemo, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CLOUD_VERT from './shaders/cloud.vert.glsl'
import CLOUD_FRAG from './shaders/cloud.frag.glsl'
import { useWeatherStore } from '../../../store/weatherStore'
import { useWindStore } from '../../../store/windStore'

// World-space UV drift speed (in UV units/s at windMult=1)
const DRIFT_SPEED = 0.006

// Camera is always at ship + (200, 140, 200)
const CAM_DX = 200
const CAM_DZ = 200

export default function CloudShadows() {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uCover:  { value: 0 },
          uOffset: { value: new THREE.Vector2() },
          uTime:   { value: 0 },
        },
        vertexShader: CLOUD_VERT,
        fragmentShader: CLOUD_FRAG,
      }),
    []
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ camera, clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const weather = useWeatherStore.getState()
    const wind = useWindStore.getState()

    // Keep plane centered on ship so the boundary never enters the visible frustum
    const mesh = meshRef.current
    if (mesh) {
      mesh.position.x = camera.position.x - CAM_DX
      mesh.position.z = camera.position.z - CAM_DZ
    }

    material.uniforms.uCover.value = weather.cloudShadow
    material.uniforms.uTime.value  = clock.getElapsedTime()
    const drift = DRIFT_SPEED * weather.windMult * dt
    material.uniforms.uOffset.value.x += wind.dir.x * drift
    material.uniforms.uOffset.value.y += wind.dir.y * drift
  })

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position-y={5}
      frustumCulled={false}
      renderOrder={15}
    >
      <planeGeometry args={[3200, 3200]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
