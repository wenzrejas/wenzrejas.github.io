import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VERT } from './shaders/vertex'
import { FRAG } from './shaders/fragment'
import { OCEAN_DEFAULTS } from './constants'
import { useDebug } from '../../Debug/DebugControls'

export default function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { ocean } = useDebug()

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uWaveAmp: { value: OCEAN_DEFAULTS.waveAmp },
          uWaveSpeed: { value: OCEAN_DEFAULTS.waveSpeed },
          uScale: { value: OCEAN_DEFAULTS.waterScale },
          uSmoothness: { value: OCEAN_DEFAULTS.cellSmoothness },
          uEdgeThreshold: { value: OCEAN_DEFAULTS.edgeThreshold },
          uEdgeSoftness: { value: OCEAN_DEFAULTS.edgeSoftness },
          uFlowX: { value: OCEAN_DEFAULTS.flowX },
          uFlowZ: { value: OCEAN_DEFAULTS.flowZ },
          uCellSpeed: { value: OCEAN_DEFAULTS.cellSpeed },
          uNoiseScale: { value: OCEAN_DEFAULTS.noiseScale },
          uNoiseFlowSpeed: { value: OCEAN_DEFAULTS.noiseFlowSpeed },
          uDistortAmount: { value: OCEAN_DEFAULTS.distortAmount },
          uDeepColor: { value: new THREE.Color(OCEAN_DEFAULTS.deepColor) },
          uMidColor: { value: new THREE.Color(OCEAN_DEFAULTS.midColor) },
          uMidPos: { value: OCEAN_DEFAULTS.midPos },
          uHighlight: { value: new THREE.Color(OCEAN_DEFAULTS.highlightColor) },
          uOpacity: { value: OCEAN_DEFAULTS.opacity },
          uDeepOpacity: { value: OCEAN_DEFAULTS.deepOpacity },
          uFresnelPower: { value: OCEAN_DEFAULTS.fresnelPower },
          uFresnelStrength: { value: OCEAN_DEFAULTS.fresnelStrength },
          uFoamAmount: { value: OCEAN_DEFAULTS.foamAmount },
          uSpecularStrength: { value: OCEAN_DEFAULTS.specularStrength },
          uSpecularPower: { value: OCEAN_DEFAULTS.specularPower },
          uCrestStrength: { value: OCEAN_DEFAULTS.crestStrength },
          uSunDir: {
            value: new THREE.Vector3(OCEAN_DEFAULTS.sunX, OCEAN_DEFAULTS.sunY, OCEAN_DEFAULTS.sunZ),
          },
        },
      }),
    []
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const uniforms = material.uniforms
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uWaveAmp.value = ocean.waveAmp
    uniforms.uWaveSpeed.value = ocean.waveSpeed
    uniforms.uScale.value = ocean.waterScale
    uniforms.uSmoothness.value = ocean.cellSmoothness
    uniforms.uEdgeThreshold.value = ocean.edgeThreshold
    uniforms.uEdgeSoftness.value = ocean.edgeSoftness
    uniforms.uFlowX.value = ocean.flowX
    uniforms.uFlowZ.value = ocean.flowZ
    uniforms.uCellSpeed.value = ocean.cellSpeed
    uniforms.uNoiseScale.value = ocean.noiseScale
    uniforms.uNoiseFlowSpeed.value = ocean.noiseFlowSpeed
    uniforms.uDistortAmount.value = ocean.distortAmount
    uniforms.uDeepColor.value.set(ocean.deepColor)
    uniforms.uMidColor.value.set(ocean.midColor)
    uniforms.uMidPos.value = ocean.midPos
    uniforms.uHighlight.value.set(ocean.highlightColor)
    uniforms.uOpacity.value = ocean.opacity
    uniforms.uDeepOpacity.value = ocean.deepOpacity
    uniforms.uFresnelPower.value = ocean.fresnelPower
    uniforms.uFresnelStrength.value = ocean.fresnelStrength
    uniforms.uFoamAmount.value = ocean.foamAmount
    uniforms.uSpecularStrength.value = ocean.specularStrength
    uniforms.uSpecularPower.value = ocean.specularPower
    uniforms.uCrestStrength.value = ocean.crestStrength
    uniforms.uSunDir.value.set(ocean.sunX, ocean.sunY, ocean.sunZ)
  })

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position={[0, -0.1, 0]}
      frustumCulled={false}
      renderOrder={2}
    >
      <planeGeometry args={[2600, 2600, 256, 256]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
