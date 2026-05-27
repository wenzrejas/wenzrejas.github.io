import { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SPARKLE_VERT from './shaders/sparkle.vert.glsl'
import SPARKLE_FRAG from './shaders/sparkle.frag.glsl'
import { useWeatherStore } from '../../../store/weatherStore'
import { useCycleStore } from '../../../store/cycleStore'

const COUNT = 250
const SPREAD = 325

function randomLife() {
  return 1.0 + Math.random() * 2.5
}
function randomSize() {
  return 8 + Math.random() * 8
}

export default function OceanSparkles({
  shipRef,
}: {
  shipRef: React.RefObject<THREE.Group | null>
}) {
  const posArr = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * SPREAD * 2
      arr[i * 3 + 1] = 1.5
      arr[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 2
    }
    return arr
  }, [])

  const lifeArr = useMemo(() => {
    const arr = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) arr[i] = Math.random() * randomLife()
    return arr
  }, [])

  const maxLifeArr = useMemo(() => {
    const arr = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) arr[i] = randomLife()
    return arr
  }, [])

  const sizeArr = useMemo(() => {
    const arr = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) arr[i] = randomSize()
    return arr
  }, [])

  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    g.setAttribute('aLifetime', new THREE.BufferAttribute(lifeArr, 1))
    g.setAttribute('aMaxLifetime', new THREE.BufferAttribute(maxLifeArr, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizeArr, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)

    const m = new THREE.ShaderMaterial({
      vertexShader: SPARKLE_VERT,
      fragmentShader: SPARKLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uIntensity: { value: 0 },
        uColor: { value: new THREE.Color('#c8f0ff') },
        uArmSharpness: { value: 14.0 },
        uArmFalloff: { value: 1.5 },
        uGlowRadius: { value: 3.5 },
      },
    })

    return { geo: g, mat: m }
  }, [posArr, lifeArr, maxLifeArr, sizeArr])

  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat]
  )

  useFrame((_, delta) => {
    const weather = useWeatherStore.getState()
    const cycle = useCycleStore.getState()

    const moonFactor = Math.max(0, (weather.moonMult - 1.0) / 2.0)
    // Only start appearing well into night (nightFactor > 0.6), not at dusk
    const nightGated = Math.max(0, Math.min(1, (cycle.nightFactor - 0.6) / 0.4))
    const intensity = moonFactor * nightGated
    mat.uniforms.uIntensity.value = intensity
    if (intensity <= 0.005) return

    const ship = shipRef.current
    const cx = ship?.position.x ?? 0
    const cz = ship?.position.z ?? 0

    const dt = Math.min(delta, 0.05)
    let respawned = false

    for (let i = 0; i < COUNT; i++) {
      lifeArr[i] += dt

      if (lifeArr[i] >= maxLifeArr[i]) {
        posArr[i * 3] = cx + (Math.random() - 0.5) * SPREAD * 2
        posArr[i * 3 + 1] = 1.5
        posArr[i * 3 + 2] = cz + (Math.random() - 0.5) * SPREAD * 2
        lifeArr[i] = 0
        maxLifeArr[i] = randomLife()
        sizeArr[i] = randomSize()
        respawned = true
      }
    }

    ;(geo.getAttribute('aLifetime') as THREE.BufferAttribute).needsUpdate = true
    if (respawned) {
      ;(geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
      ;(geo.getAttribute('aMaxLifetime') as THREE.BufferAttribute).needsUpdate = true
      ;(geo.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true
    }
  })

  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={3} />
}
