import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { zoomedOutBoost } from '@/app/experience/worldZoom'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { disposeAll } from '@/utils/dispose'
import { stepBloom } from './bloomField'
import {
  buildBloomGeometry,
  buildBloomHaloGeometry,
  createBloomHaloMaterial,
  createBloomMaterial,
  writeBloom,
} from './bloomModel'
import { JELLY_ZOOMED_OUT_BOOST_MAX } from './constants'

export default function JellyfishBloom() {
  const meshRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => buildBloomGeometry(), [])
  const material = useMemo(() => createBloomMaterial(), [])
  const haloGeometry = useMemo(() => buildBloomHaloGeometry(geometry), [geometry])
  const haloMaterial = useMemo(() => createBloomHaloMaterial(material), [material])
  const size = useThree((state) => state.size)
  const boost = useMemo(
    () => zoomedOutBoost(size.width, size.height, JELLY_ZOOMED_OUT_BOOST_MAX),
    [size]
  )

  useEffect(
    () => () => disposeAll(geometry, material, haloGeometry, haloMaterial),
    [geometry, material, haloGeometry, haloMaterial]
  )

  useFrame(({ clock, camera }, delta) => {
    const mesh = meshRef.current
    const halo = haloRef.current
    if (!mesh || !halo) return

    const time = clock.getElapsedTime()
    const isShowing = stepBloom(Math.min(delta, MAX_FRAME_SECONDS), time, camera, boost)
    const drawn = isShowing ? writeBloom(geometry, haloGeometry, material, boost) : 0
    mesh.visible = drawn > 0
    halo.visible = drawn > 0
  })

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.inWater}
      />
      <mesh
        ref={haloRef}
        geometry={haloGeometry}
        material={haloMaterial}
        frustumCulled={false}
        visible={false}
        renderOrder={RENDER_LAYER.inWater}
      />
    </>
  )
}
