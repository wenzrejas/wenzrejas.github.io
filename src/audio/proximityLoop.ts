import * as THREE from 'three'
import { audio, type SoundHandle } from './audioManager'
import type { SoundName } from './sounds'

export interface LoopRamp {
  rampSeconds: number
  fadeSeconds: number
  levelStep: number
}

export interface ProximityLoop {
  name: SoundName
  ramp: LoopRamp
  handle: SoundHandle | null
  level: number
}

export const createProximityLoop = (name: SoundName, ramp: LoopRamp): ProximityLoop => ({
  name,
  ramp,
  handle: null,
  level: 0,
})

export const nearnessOf = (distance: number, fullDistance: number, silentDistance: number) =>
  1 - THREE.MathUtils.smoothstep(distance, fullDistance, silentDistance)

export function quietLoop(loop: ProximityLoop) {
  loop.handle?.stop(loop.ramp.fadeSeconds)
  loop.handle = null
  loop.level = 0
}

export function holdLoopAt(loop: ProximityLoop, level: number) {
  const isPlaying = loop.handle?.active === true
  if (isPlaying === level > 0 && Math.abs(level - loop.level) < loop.ramp.levelStep) return
  if (level <= 0) return quietLoop(loop)
  loop.level = level
  if (isPlaying) loop.handle?.setVolume(level, loop.ramp.rampSeconds)
  else if (audio.ready) {
    loop.handle = audio.play(loop.name, {
      loop: true,
      volume: level,
      fadeIn: loop.ramp.rampSeconds,
    })
  }
}
