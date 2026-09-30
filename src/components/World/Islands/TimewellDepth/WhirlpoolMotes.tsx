import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { mix } from '../../../../utils/math'
import { nightGlow } from '../nightGlow'
import {
  WHIRLPOOL_MOTE_DAY_SHARE,
  WHIRLPOOL_MOTE_ORIGIN_X,
  WHIRLPOOL_MOTE_ORIGIN_Z,
  WHIRLPOOL_MOTE_RISE,
  WHIRLPOOL_MOTE_SIZE,
  WHIRLPOOL_RADIUS,
} from './constants'
import { buildMoteGeometry, createMoteMaterial } from './whirlpoolModel'

interface WhirlpoolMotesProps {
  islandScale: number
}

export default function WhirlpoolMotes({ islandScale }: WhirlpoolMotesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const geometry = useMemo(() => buildMoteGeometry(), [])
  const material = useMemo(() => createMoteMaterial(), [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame(({ clock, camera, gl }) => {
    const points = pointsRef.current
    if (!points) return

    const { uniforms } = points.material as THREE.ShaderMaterial
    const zoom = (camera as THREE.OrthographicCamera).zoom
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uMagic.value = mix(WHIRLPOOL_MOTE_DAY_SHARE, 1, nightGlow())
    uniforms.uSize.value = WHIRLPOOL_MOTE_SIZE * zoom * gl.getPixelRatio()
    uniforms.uRise.value = WHIRLPOOL_MOTE_RISE / (WHIRLPOOL_RADIUS * islandScale)
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={[WHIRLPOOL_MOTE_ORIGIN_X, 0, WHIRLPOOL_MOTE_ORIGIN_Z]}
      frustumCulled={false}
      renderOrder={5}
    />
  )
}
