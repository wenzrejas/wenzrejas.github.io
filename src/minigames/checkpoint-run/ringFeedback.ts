import { audio } from '@/audio/audioManager'
import type { CourseKey } from './courses'

export interface RingPass {
  course: CourseKey
  ring: number
  kind: 'passed' | 'perfect' | 'finished'
}

type RingPassListener = (pass: RingPass) => void

const listeners = new Set<RingPassListener>()

export function onRingPass(listener: RingPassListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function announceRingPass(pass: RingPass) {
  audio.play('ringPass')
  for (const listener of listeners) listener(pass)
}
