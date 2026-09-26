import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWeatherStore } from '../../../store/weatherStore'
import { useWindStore } from '../../../store/windStore'
import { CLOUD_PLANE_SIZE, CLOUD_TILE, createCloudTexture } from '../../../utils/cloudTexture'
import {
  cloudRemap,
  cloudScroll,
  cloudShadowUniforms,
  updateCloudScroll,
} from '../../../utils/cloudShadow'
import CLOUD_VERT from './shaders/cloudShadow.vert.glsl'
import CLOUD_FRAG from './shaders/cloudShadow.frag.glsl'

const PLANE_Y = 0.06
const MAX_OPACITY = 0.5
const SHADOW_COLOR = '#0a2233'

export default function CloudShadows() {
  const meshRef = useRef<THREE.Mesh>(null)
  const material = useMemo(() => {
    const repeat = CLOUD_PLANE_SIZE / CLOUD_TILE
    return new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: createCloudTexture() },
        uRepeat: { value: new THREE.Vector2(repeat, repeat) },
        uOffset: { value: new THREE.Vector2() },
        uGain: { value: 1 },
        uBias: { value: 0 },
        uOpacity: { value: 0 },
        uColor: { value: new THREE.Color(SHADOW_COLOR) },
      },
    })
  }, [])

  useEffect(() => {
    cloudShadowUniforms.uCloudMap.value = material.uniforms.uMap.value
    return () => {
      cloudShadowUniforms.uCloudMap.value = null
      material.uniforms.uMap.value?.dispose()
      material.dispose()
    }
  }, [material])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    const weather = useWeatherStore.getState()
    const wind = useWindStore.getState()

    updateCloudScroll(Math.min(delta, 0.05), wind.dir.x, wind.dir.y)
    const { strength, gain, bias } = cloudRemap(weather.cloudShadow)
    const offsetU = cloudScroll.x / CLOUD_TILE
    const offsetV = cloudScroll.z / CLOUD_TILE

    const { uniforms } = mesh.material as THREE.ShaderMaterial
    uniforms.uOpacity.value = strength * MAX_OPACITY
    uniforms.uGain.value = gain
    uniforms.uBias.value = bias
    uniforms.uOffset.value.set(offsetU, offsetV)

    cloudShadowUniforms.uCloudStrength.value = strength
    cloudShadowUniforms.uCloudGain.value = gain
    cloudShadowUniforms.uCloudBias.value = bias
    cloudShadowUniforms.uCloudOffset.value.set(offsetU, offsetV)
  })

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position-y={PLANE_Y}
      material={material}
      renderOrder={3}
      frustumCulled={false}
      castShadow={false}
      receiveShadow={false}
    >
      <planeGeometry args={[CLOUD_PLANE_SIZE, CLOUD_PLANE_SIZE]} />
    </mesh>
  )
}
