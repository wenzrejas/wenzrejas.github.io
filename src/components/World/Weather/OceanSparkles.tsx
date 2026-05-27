import { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SPARKLE_VERT from './shaders/sparkle.vert.glsl'
import SPARKLE_FRAG from './shaders/sparkle.frag.glsl'
import { useWeatherStore } from '../../../store/weatherStore'
import { useCycleStore } from '../../../store/cycleStore'

const COUNT = 800

export default function OceanSparkles({ shipRef }: { shipRef: React.RefObject<THREE.Group | null> }) {
  const { geo, mat } = useMemo(() => {
    const seeds = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      seeds[i * 3    ] = Math.random()  // x world seed [0, 1)
      seeds[i * 3 + 1] = Math.random()  // z world seed [0, 1)
      seeds[i * 3 + 2] = Math.random()  // twinkling seed
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3))
    g.setAttribute('aSeed',    new THREE.BufferAttribute(seeds, 3))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)

    const m = new THREE.ShaderMaterial({
      vertexShader:   SPARKLE_VERT,
      fragmentShader: SPARKLE_FRAG,
      transparent:    true,
      depthWrite:     false,
      depthTest:      true,
      blending:       THREE.AdditiveBlending,
      uniforms: {
        uTime:      { value: 0 },
        uShipXZ:    { value: new THREE.Vector2() },
        uIntensity: { value: 0 },
      },
    })

    return { geo: g, mat: m }
  }, [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame(({ clock }) => {
    const weather = useWeatherStore.getState()
    const cycle = useCycleStore.getState()

    // moonMult=2.5 for moonlit → moonFactor=1.0; ≤1.0 for all other weather → 0
    const moonFactor  = Math.max(0, (weather.moonMult - 1.0) / 1.5)
    // nightFactor=1 at midnight, 0 during day — both must be true for sparkles
    const intensity   = moonFactor * cycle.nightFactor
    mat.uniforms.uIntensity.value = intensity
    if (intensity <= 0.005) return

    mat.uniforms.uTime.value = clock.getElapsedTime()
    const ship = shipRef.current
    mat.uniforms.uShipXZ.value.set(ship?.position.x ?? 0, ship?.position.z ?? 0)
  })

  return (
    <points
      geometry={geo}
      material={mat}
      frustumCulled={false}
      renderOrder={3}
    />
  )
}
