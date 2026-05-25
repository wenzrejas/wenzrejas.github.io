import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WAKE_VERT, WAKE_FRAG } from './shaders/wake'
import {
  WAKE_TRAIL_LENGTH,
  WAKE_ARM_NEAR,
  WAKE_ARM_FAR,
  WAKE_ARM_HALF_WIDTH,
  WAKE_MIN_SAMPLE_DIST,
  WAKE_TOTAL_VERTS,
} from './constants'

interface TrailPoint {
  x: number
  z: number
}

export default function WakeTrail({ shipRef }: { shipRef: React.RefObject<THREE.Mesh | null> }) {
  const trailPoints = useRef<TrailPoint[]>(
    Array.from({ length: WAKE_TRAIL_LENGTH }, () => ({ x: 0, z: 0 }))
  )
  const headIndex = useRef(0)
  const activeCount = useRef(0)
  const lastSampledPoint = useRef({ x: Infinity, z: Infinity })
  const isDirty = useRef(false)
  const fadeProgress = useRef(1.1)
  const wasStationary = useRef(true)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positionArray = new Float32Array(WAKE_TOTAL_VERTS * 3)
    const uvArray = new Float32Array(WAKE_TOTAL_VERTS * 2)
    const indexArray: number[] = []

    for (let i = 0; i < WAKE_TRAIL_LENGTH; i++) {
      const trailUV = i / (WAKE_TRAIL_LENGTH - 1)
      const outerLeft = i * 4
      const innerLeft = i * 4 + 1
      const innerRight = i * 4 + 2
      const outerRight = i * 4 + 3
      uvArray[outerLeft * 2] = 0
      uvArray[outerLeft * 2 + 1] = trailUV
      uvArray[innerLeft * 2] = 1
      uvArray[innerLeft * 2 + 1] = trailUV
      uvArray[innerRight * 2] = 1
      uvArray[innerRight * 2 + 1] = trailUV
      uvArray[outerRight * 2] = 0
      uvArray[outerRight * 2 + 1] = trailUV
    }

    for (let i = 0; i < WAKE_TRAIL_LENGTH - 1; i++) {
      const outerLeft = i * 4
      const innerLeft = i * 4 + 1
      const innerRight = i * 4 + 2
      const outerRight = i * 4 + 3
      const nextOuterLeft = outerLeft + 4
      const nextInnerLeft = innerLeft + 4
      const nextInnerRight = innerRight + 4
      const nextOuterRight = outerRight + 4
      indexArray.push(outerLeft, nextOuterLeft, innerLeft, innerLeft, nextOuterLeft, nextInnerLeft)
      indexArray.push(
        innerRight,
        nextInnerRight,
        outerRight,
        outerRight,
        nextInnerRight,
        nextOuterRight
      )
    }

    const positionAttr = new THREE.BufferAttribute(positionArray, 3)
    positionAttr.usage = THREE.DynamicDrawUsage

    geo.setAttribute('position', positionAttr)
    geo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
    geo.setIndex(indexArray)
    geo.setDrawRange(0, 0)
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uFadeProgress: { value: 1.1 },
          uInvActiveMax: { value: 1.0 },
        },
        vertexShader: WAKE_VERT,
        fragmentShader: WAKE_FRAG,
      }),
    []
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock }, delta) => {
    const ship = shipRef.current
    if (!ship) return

    const dt = isFinite(delta) && delta > 0 ? Math.min(delta, 0.05) : 0.016
    material.uniforms.uTime.value = clock.getElapsedTime()
    material.uniforms.uInvActiveMax.value =
      (WAKE_TRAIL_LENGTH - 1) / Math.max(1, activeCount.current - 1)

    const shipX = ship.position.x
    const shipZ = ship.position.z
    const sampled = lastSampledPoint.current

    let moved = false
    if (Math.hypot(shipX - sampled.x, shipZ - sampled.z) > WAKE_MIN_SAMPLE_DIST) {
      headIndex.current = (headIndex.current - 1 + WAKE_TRAIL_LENGTH) % WAKE_TRAIL_LENGTH
      trailPoints.current[headIndex.current].x = shipX
      trailPoints.current[headIndex.current].z = shipZ
      if (activeCount.current < WAKE_TRAIL_LENGTH) activeCount.current++
      sampled.x = shipX
      sampled.z = shipZ
      isDirty.current = true
      moved = true
    }

    if (moved) {
      if (wasStationary.current) {
        if (fadeProgress.current > 0 && fadeProgress.current < 1.0) {
          const keep =
            Math.max(0, Math.floor((1.0 - fadeProgress.current) * (WAKE_TRAIL_LENGTH - 1))) + 1
          activeCount.current = Math.min(activeCount.current, keep)
          geometry.setDrawRange(0, Math.max(0, activeCount.current - 1) * 12)
        } else {
          fadeProgress.current = 0.0
        }
      }
      wasStationary.current = false
      fadeProgress.current = Math.max(0.0, fadeProgress.current - dt * 1.6)
    } else {
      wasStationary.current = true
      fadeProgress.current = Math.min(1.1, fadeProgress.current + dt * 0.7)
    }
    material.uniforms.uFadeProgress.value = fadeProgress.current

    if (fadeProgress.current >= 1.1 && activeCount.current > 0) {
      activeCount.current = 0
      isDirty.current = false
      geometry.setDrawRange(0, 0)
    }

    if (!isDirty.current || activeCount.current < 2) return
    isDirty.current = false

    const positionArray = geometry.attributes.position.array as Float32Array
    const count = activeCount.current

    for (let i = 0; i < count; i++) {
      const outerLeftOffset = i * 12
      const innerLeftOffset = i * 12 + 3
      const innerRightOffset = i * 12 + 6
      const outerRightOffset = i * 12 + 9

      const pointIdx = (headIndex.current + i) % WAKE_TRAIL_LENGTH
      const point = trailPoints.current[pointIdx]
      const prevIdx = (headIndex.current + Math.max(0, i - 1)) % WAKE_TRAIL_LENGTH
      const nextIdx = (headIndex.current + Math.min(count - 1, i + 1)) % WAKE_TRAIL_LENGTH

      const tangentX = trailPoints.current[nextIdx].x - trailPoints.current[prevIdx].x
      const tangentZ = trailPoints.current[nextIdx].z - trailPoints.current[prevIdx].z
      const tangentLen = Math.sqrt(tangentX * tangentX + tangentZ * tangentZ) || 1
      const perpX = -tangentZ / tangentLen
      const perpZ = tangentX / tangentLen

      const trailPosition = i / (WAKE_TRAIL_LENGTH - 1)
      const normalizedAge = i / Math.max(1, count - 1)
      const taper = 1.0 - normalizedAge
      const armWidth = WAKE_ARM_NEAR + (WAKE_ARM_FAR - WAKE_ARM_NEAR) * trailPosition
      const outerHalfWidth = armWidth + WAKE_ARM_HALF_WIDTH * taper
      const innerHalfWidth = Math.max(0.01, armWidth - WAKE_ARM_HALF_WIDTH * taper)

      positionArray[outerLeftOffset] = point.x + perpX * outerHalfWidth
      positionArray[outerLeftOffset + 1] = 0.3
      positionArray[outerLeftOffset + 2] = point.z + perpZ * outerHalfWidth

      positionArray[innerLeftOffset] = point.x + perpX * innerHalfWidth
      positionArray[innerLeftOffset + 1] = 0.3
      positionArray[innerLeftOffset + 2] = point.z + perpZ * innerHalfWidth

      positionArray[innerRightOffset] = point.x - perpX * innerHalfWidth
      positionArray[innerRightOffset + 1] = 0.3
      positionArray[innerRightOffset + 2] = point.z - perpZ * innerHalfWidth

      positionArray[outerRightOffset] = point.x - perpX * outerHalfWidth
      positionArray[outerRightOffset + 1] = 0.3
      positionArray[outerRightOffset + 2] = point.z - perpZ * outerHalfWidth
    }

    geometry.setDrawRange(0, (count - 1) * 12)
    geometry.attributes.position.needsUpdate = true
  })

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={3} />
}
