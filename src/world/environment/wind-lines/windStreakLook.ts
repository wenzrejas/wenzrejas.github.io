import type * as THREE from 'three'
import type { WindLineControls } from '@/app/debug/types'
import { uniformsOf } from '@/utils/meshes'
import { advanceStreak, type WindStreak } from './windStreaks'

export function drawStreaks(
  meshes: (THREE.Mesh | null)[],
  streaks: WindStreak[],
  tuning: WindLineControls,
  dt: number
) {
  for (let i = 0; i < streaks.length; i++) {
    const streak = streaks[i]
    const mesh = meshes[i]
    if (!mesh) continue
    if (!streak.isActive || !tuning.windEnabled) {
      mesh.visible = false
      continue
    }
    advanceStreak(streak, dt)
    mesh.visible = streak.isActive
    mesh.position.set(streak.x, streak.y, streak.z)
    mesh.rotation.y = streak.angle
    mesh.scale.set(streak.length, streak.amplitude, 1)
    const uniforms = uniformsOf(mesh)
    uniforms.uProgress.value = streak.progress
    uniforms.uOpacity.value = tuning.windOpacity
    uniforms.uThickness.value = tuning.lineWidth
  }
}
