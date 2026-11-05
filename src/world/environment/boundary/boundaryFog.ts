import * as THREE from 'three'
import { useCycleStore } from '@/store/cycleStore'
import { useDebugStore } from '@/store/debugStore'
import { mix } from '@/utils/math'
import { FOG_LIT_MIX, FOG_LIT_MIX_NIGHT, FOG_SHADE_MIX, FOG_SUN_FULL_HEIGHT } from './constants'

const _moonLight = new THREE.Vector2()

export function paintBoundaryFog(uniforms: Record<string, THREE.IUniform>, time: number) {
  const boundary = useDebugStore.getState().boundary
  const cycle = useCycleStore.getState()
  const { oceanSunDirection: sun, oceanMoonDirection: moon, nightFactor } = cycle
  uniforms.uTime.value = time
  uniforms.uRadius.value = boundary.radius
  uniforms.uFalloff.value = boundary.falloff
  uniforms.uHeight.value = boundary.bankHeight
  ;(uniforms.uShade.value as THREE.Color).lerpColors(cycle.fogColor, cycle.oceanDeep, FOG_SHADE_MIX)
  ;(uniforms.uLit.value as THREE.Color).lerpColors(
    cycle.fogColor,
    cycle.foamColor,
    mix(FOG_LIT_MIX, FOG_LIT_MIX_NIGHT, nightFactor)
  )
  ;(uniforms.uLight.value as THREE.Vector2)
    .set(sun.x, sun.z)
    .normalize()
    .multiplyScalar(THREE.MathUtils.smoothstep(sun.y, 0, FOG_SUN_FULL_HEIGHT))
    .addScaledVector(_moonLight.set(moon.x, moon.z).normalize(), nightFactor)
}
