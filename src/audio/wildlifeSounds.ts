import { rand } from '../utils/math'
import { audio, type SoundHandle } from './audioManager'
import {
  DOLPHIN_CALL_MAX,
  DOLPHIN_CALL_MIN,
  DOLPHIN_FIRST_CALL_MAX,
  DOLPHIN_FIRST_CALL_MIN,
  DOLPHIN_PITCH_MAX,
  DOLPHIN_PITCH_MIN,
  SEAGULL_CHANCE,
  SEAGULL_COOLDOWN,
  SEAGULL_FADE_IN,
} from './constants'

let dolphinTimer = rand(DOLPHIN_FIRST_CALL_MIN, DOLPHIN_FIRST_CALL_MAX)
let lastSeagullCall = -Infinity

export function updateDolphinCalls(present: boolean, dt: number): void {
  if (!present) {
    dolphinTimer = rand(DOLPHIN_FIRST_CALL_MIN, DOLPHIN_FIRST_CALL_MAX)
    return
  }
  dolphinTimer -= dt
  if (dolphinTimer > 0) return
  dolphinTimer = rand(DOLPHIN_CALL_MIN, DOLPHIN_CALL_MAX)
  makeRoom(
    audio.play('dolphin', {
      volume: rand(0.7, 1),
      rate: rand(DOLPHIN_PITCH_MIN, DOLPHIN_PITCH_MAX),
    })
  )
}

export function maybeSeagullCall(time: number): SoundHandle | null {
  if (time - lastSeagullCall < SEAGULL_COOLDOWN || Math.random() >= SEAGULL_CHANCE) return null
  lastSeagullCall = time
  return makeRoom(audio.play('seagulls', { volume: rand(0.8, 1), fadeIn: SEAGULL_FADE_IN }))
}

function makeRoom(call: SoundHandle): SoundHandle {
  call.whenDone(audio.duck())
  return call
}
