import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { cloudShadowUniforms, stepCloudShadows } from './cloudShadow'
import { createCloudPlaneMaterial } from './cloudShadowModel'
import { CLOUD_PLANE_SIZE, CLOUD_PLANE_Y } from './constants'

export default function CloudShadows() {
  const material = useMemo(() => createCloudPlaneMaterial(), [])

  useEffect(() => {
    const cloudMap = material.uniforms.uMap.value as THREE.Texture
    cloudShadowUniforms.uCloudMap.value = cloudMap
    return () => {
      cloudShadowUniforms.uCloudMap.value = null
      cloudMap.dispose()
      material.dispose()
    }
  }, [material])

  useFrame((_, delta) => stepCloudShadows(material.uniforms, Math.min(delta, MAX_FRAME_SECONDS)))

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position-y={CLOUD_PLANE_Y}
      material={material}
      renderOrder={RENDER_LAYER.waterSurface}
      frustumCulled={false}
    >
      <planeGeometry args={[CLOUD_PLANE_SIZE, CLOUD_PLANE_SIZE]} />
    </mesh>
  )
}
