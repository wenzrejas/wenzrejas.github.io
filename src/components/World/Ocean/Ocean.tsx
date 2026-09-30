import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import VERT from './shaders/ocean.vert.glsl'
import FRAG from './shaders/ocean.frag.glsl'
import {
  OCEAN_DEFAULTS,
  OCEAN_FUNNEL_OVERSHOOT,
  OCEAN_PLANE_SIZE,
  OCEAN_SEGMENTS,
  OCEAN_Y,
  RAIN_DARKEN,
} from './constants'
import { waveUniforms } from './waveUniforms'
import { oceanSurfaceUniforms } from './oceanSurfaceUniforms'
import { floatDefines } from '../../../utils/glsl'
import { whirlpoolFunnelUniforms } from '../../../utils/whirlpoolFunnel'
import { useDebugStore } from '../../../store/debugStore'
import { useCycleStore } from '../../../store/cycleStore'
import { useWindStore } from '../../../store/windStore'
import { useWeatherStore } from '../../../store/weatherStore'

const PRIMARY_WAVE_DIR = new THREE.Vector2(0.97, -0.26).normalize()

export default function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null)
  const smoothedWindAmp = useRef(1.0)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
        vertexShader: VERT,
        fragmentShader: FRAG,
        defines: floatDefines({ FUNNEL_OVERSHOOT: OCEAN_FUNNEL_OVERSHOOT }),
        uniforms: {
          ...waveUniforms,
          ...oceanSurfaceUniforms,
          ...whirlpoolFunnelUniforms,
          uScale: { value: OCEAN_DEFAULTS.waterScale },
          uFlowX: { value: OCEAN_DEFAULTS.flowX },
          uFlowZ: { value: OCEAN_DEFAULTS.flowZ },
          uNoiseScale: { value: OCEAN_DEFAULTS.noiseScale },
          uNoiseFlowSpeed: { value: OCEAN_DEFAULTS.noiseFlowSpeed },
          uDistortAmount: { value: OCEAN_DEFAULTS.distortAmount },
          uFoamColor: { value: new THREE.Color(1, 1, 1) },
          uFoamAmount: { value: OCEAN_DEFAULTS.foamAmount },
          uCrestStrength: { value: OCEAN_DEFAULTS.crestStrength },
        },
      }),
    []
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    const ocean = useDebugStore.getState().ocean
    const cycle = useCycleStore.getState()
    const wind = useWindStore.getState()
    const weather = useWeatherStore.getState()

    const { uniforms } = mesh.material as THREE.ShaderMaterial
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
    const rainDarken = 1 - weather.rainIntensity * RAIN_DARKEN
    uniforms.uDeepColor.value.copy(cycle.oceanDeep).multiplyScalar(rainDarken)
    uniforms.uMidColor.value.copy(cycle.oceanMid).multiplyScalar(rainDarken)
    uniforms.uMidPos.value = ocean.midPos
    uniforms.uHighlight.value.set(ocean.highlightColor)
    uniforms.uFoamColor.value.copyLinearToSRGB(cycle.foamColor)
    uniforms.uOpacity.value = ocean.opacity
    uniforms.uDeepOpacity.value = ocean.deepOpacity
    uniforms.uFresnelPower.value = ocean.fresnelPower
    uniforms.uFresnelStrength.value = ocean.fresnelStrength * cycle.fresnel
    uniforms.uFoamAmount.value = ocean.foamAmount
    uniforms.uSpecularStrength.value = ocean.specularStrength * cycle.specular
    uniforms.uSpecularPower.value = ocean.specularPower
    uniforms.uCrestStrength.value = ocean.crestStrength
    uniforms.uSunDir.value.copy(cycle.oceanSunDir)
    uniforms.uMoonDir.value.copy(cycle.oceanMoonDir)
    uniforms.uMoonIntensity.value = cycle.nightFactor * Math.max(0, weather.moonMult - 1.0)
    const alignment = wind.dir.dot(PRIMARY_WAVE_DIR)
    const targetAmp = (0.5 + (0.8 * (alignment + 1)) / 2) * weather.waveAmpMult
    smoothedWindAmp.current += (targetAmp - smoothedWindAmp.current) * Math.min(1, delta * 0.05)
    uniforms.uWindAmp.value = smoothedWindAmp.current
  })

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position={[0, OCEAN_Y, 0]}
      frustumCulled={false}
      renderOrder={2}
    >
      <planeGeometry args={[OCEAN_PLANE_SIZE, OCEAN_PLANE_SIZE, OCEAN_SEGMENTS, OCEAN_SEGMENTS]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
