import { useMemo, useEffect, useRef } from 'react'
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

function buildSparkleGeometry(): THREE.BufferGeometry {
  const posArr = new Float32Array(COUNT * 3)
  const lifeArr = new Float32Array(COUNT)
  const maxLifeArr = new Float32Array(COUNT)
  const sizeArr = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) {
    posArr[i * 3] = (Math.random() - 0.5) * SPREAD * 2
    posArr[i * 3 + 1] = 1.5
    posArr[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 2
    lifeArr[i] = Math.random() * randomLife()
    maxLifeArr[i] = randomLife()
    sizeArr[i] = randomSize()
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
  g.setAttribute('aLifetime', new THREE.BufferAttribute(lifeArr, 1))
  g.setAttribute('aMaxLifetime', new THREE.BufferAttribute(maxLifeArr, 1))
  g.setAttribute('aSize', new THREE.BufferAttribute(sizeArr, 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
  return g
}

function createSparkleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
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
}

export default function OceanSparkles({
  shipRef,
}: {
  shipRef: React.RefObject<THREE.Group | null>
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const geo = useMemo(() => buildSparkleGeometry(), [])
  const mat = useMemo(() => createSparkleMaterial(), [])

  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat]
  )

  useFrame((_, delta) => {
    const points = pointsRef.current
    if (!points) return

    const weather = useWeatherStore.getState()
    const cycle = useCycleStore.getState()

    const moonFactor = Math.max(0, (weather.moonMult - 1.0) / 2.0)
    // Only start appearing well into night (nightFactor > 0.6), not at dusk
    const nightGated = Math.max(0, Math.min(1, (cycle.nightFactor - 0.6) / 0.4))
    const intensity = moonFactor * nightGated
    ;(points.material as THREE.ShaderMaterial).uniforms.uIntensity.value = intensity
    if (intensity <= 0.005) return

    const position = points.geometry.getAttribute('position') as THREE.BufferAttribute
    const lifetime = points.geometry.getAttribute('aLifetime') as THREE.BufferAttribute
    const maxLifetime = points.geometry.getAttribute('aMaxLifetime') as THREE.BufferAttribute
    const size = points.geometry.getAttribute('aSize') as THREE.BufferAttribute
    const posArr = position.array as Float32Array
    const lifeArr = lifetime.array as Float32Array
    const maxLifeArr = maxLifetime.array as Float32Array
    const sizeArr = size.array as Float32Array

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

    lifetime.needsUpdate = true
    if (respawned) {
      position.needsUpdate = true
      maxLifetime.needsUpdate = true
      size.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef} geometry={geo} material={mat} frustumCulled={false} renderOrder={3} />
  )
}
