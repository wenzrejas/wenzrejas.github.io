import * as THREE from 'three'
import { audio } from '@/audio/audioManager'
import {
  createProximityLoop,
  holdLoopAt,
  nearnessOf,
  type ProximityLoop,
} from '@/audio/proximityLoop'
import {
  TRAIN_CRUISE_SPEED,
  TRAIN_ENGINE_IDLE_LEVEL,
  TRAIN_SOUND_FADE_SECONDS,
  TRAIN_SOUND_FULL_DISTANCE,
  TRAIN_SOUND_LEVEL_STEP,
  TRAIN_SOUND_RAMP_SECONDS,
  TRAIN_SOUND_SILENT_DISTANCE,
  TRAIN_WHISTLE_MIN_NEARNESS,
} from './constants'
import type { TrainMotion } from './trainMotion'

export interface TrainSound {
  engine: ProximityLoop
  wasDwelling: boolean
}

const _locomotive = new THREE.Vector3()

export const createTrainSound = (): TrainSound => ({
  engine: createProximityLoop('trainEngine', {
    rampSeconds: TRAIN_SOUND_RAMP_SECONDS,
    fadeSeconds: TRAIN_SOUND_FADE_SECONDS,
    levelStep: TRAIN_SOUND_LEVEL_STEP,
  }),
  wasDwelling: true,
})

export function followTrainSound(
  sound: TrainSound,
  motion: TrainMotion,
  locomotive: THREE.Object3D,
  shipX: number,
  shipZ: number,
  isAudible: boolean
) {
  _locomotive.setFromMatrixPosition(locomotive.matrixWorld)
  const distance = Math.hypot(_locomotive.x - shipX, _locomotive.z - shipZ)
  const nearness = isAudible
    ? nearnessOf(distance, TRAIN_SOUND_FULL_DISTANCE, TRAIN_SOUND_SILENT_DISTANCE)
    : 0
  const pace = THREE.MathUtils.lerp(TRAIN_ENGINE_IDLE_LEVEL, 1, motion.speed / TRAIN_CRUISE_SPEED)
  holdLoopAt(sound.engine, nearness * pace)

  const isDwelling = motion.dwellSeconds > 0
  const isDeparting = sound.wasDwelling && !isDwelling
  if (isDeparting && nearness > TRAIN_WHISTLE_MIN_NEARNESS) {
    audio.play('trainWhistle', { volume: nearness })
  }
  sound.wasDwelling = isDwelling
}
