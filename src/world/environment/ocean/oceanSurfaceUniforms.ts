import * as THREE from 'three'
import { OCEAN_DEFAULTS } from './constants'

export const oceanSurfaceUniforms = {
  uSmoothness: { value: OCEAN_DEFAULTS.cellSmoothness },
  uEdgeThreshold: { value: OCEAN_DEFAULTS.edgeThreshold },
  uEdgeSoftness: { value: OCEAN_DEFAULTS.edgeSoftness },
  uCellSpeed: { value: OCEAN_DEFAULTS.cellSpeed },
  uDeepColor: { value: new THREE.Color(OCEAN_DEFAULTS.deepColor) },
  uMidColor: { value: new THREE.Color(OCEAN_DEFAULTS.midColor) },
  uMidPosition: { value: OCEAN_DEFAULTS.midPosition },
  uHighlight: { value: new THREE.Color(OCEAN_DEFAULTS.highlightColor) },
  uOpacity: { value: OCEAN_DEFAULTS.opacity },
  uDeepOpacity: { value: OCEAN_DEFAULTS.deepOpacity },
  uFresnelPower: { value: OCEAN_DEFAULTS.fresnelPower },
  uFresnelStrength: { value: OCEAN_DEFAULTS.fresnelStrength },
  uSpecularStrength: { value: OCEAN_DEFAULTS.specularStrength },
  uSpecularPower: { value: OCEAN_DEFAULTS.specularPower },
  uSunDirection: {
    value: new THREE.Vector3(OCEAN_DEFAULTS.sunX, OCEAN_DEFAULTS.sunY, OCEAN_DEFAULTS.sunZ),
  },
  uMoonDirection: { value: new THREE.Vector3(5, 80, 5).normalize() },
  uMoonIntensity: { value: 0 },
}
