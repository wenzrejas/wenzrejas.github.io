import type { DialoguePage } from '@/data/guideCopy'
import {
  EMOTE_FRAMES_PER_SECOND,
  IDLE_FRAMES_PER_SECOND,
  MASCOT_SHEETS,
  type MascotAnimation,
} from './constants'

export interface MascotPlayback {
  page: DialoguePage | null
  animation: MascotAnimation | null
  startSeconds: number
  frame: number
  nextFrame: number
  blend: number
}

export const createPlayback = (): MascotPlayback => ({
  page: null,
  animation: null,
  startSeconds: 0,
  frame: 0,
  nextFrame: 0,
  blend: 0,
})

const framesPerSecond = (animation: MascotAnimation) =>
  animation === 'idle' ? IDLE_FRAMES_PER_SECOND : EMOTE_FRAMES_PER_SECOND

export const animationSeconds = (animation: MascotAnimation) =>
  MASCOT_SHEETS[animation].frameCount / framesPerSecond(animation)

function play(playback: MascotPlayback, animation: MascotAnimation | null, seconds: number) {
  playback.animation = animation
  playback.startSeconds = seconds
}

function followPage(
  playback: MascotPlayback,
  page: DialoguePage | null,
  isDismissed: boolean,
  seconds: number
) {
  if (page === playback.page) return
  const wasSpeaking = playback.page !== null
  playback.page = page
  if (!page) play(playback, isDismissed ? null : 'exit', seconds)
  else play(playback, wasSpeaking ? page.mood : 'appear', seconds)
}

function moveOnWhenFinished(playback: MascotPlayback, seconds: number) {
  const { animation, page } = playback
  if (!animation || animation === 'idle') return
  if (seconds - playback.startSeconds < animationSeconds(animation)) return
  if (animation === 'exit') play(playback, null, seconds)
  else if (animation === 'appear' && page) play(playback, page.mood, seconds)
  else play(playback, 'idle', seconds)
}

function updateFrames(playback: MascotPlayback, seconds: number) {
  const { animation, startSeconds } = playback
  if (!animation) return
  const { frameCount } = MASCOT_SHEETS[animation]
  const position = (seconds - startSeconds) * framesPerSecond(animation)
  const frame = Math.floor(position)
  const isLooping = animation === 'idle'
  playback.frame = isLooping ? frame % frameCount : Math.min(frame, frameCount - 1)
  playback.nextFrame = isLooping ? (frame + 1) % frameCount : Math.min(frame + 1, frameCount - 1)
  playback.blend = playback.nextFrame === playback.frame ? 0 : position - frame
}

export function stepPlayback(
  playback: MascotPlayback,
  page: DialoguePage | null,
  isDismissed: boolean,
  seconds: number
) {
  const wasShown = playback.animation !== null
  followPage(playback, page, isDismissed, seconds)
  moveOnWhenFinished(playback, seconds)
  updateFrames(playback, seconds)
  return wasShown || playback.animation !== null
}
