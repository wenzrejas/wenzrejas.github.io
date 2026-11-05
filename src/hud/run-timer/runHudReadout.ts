import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import type { Run } from '@/minigames/checkpoint-run/checkpointRun'
import { SURGE_LEVELS, SURGE_SECONDS } from '@/minigames/checkpoint-run/constants'
import { COURSES } from '@/minigames/checkpoint-run/courses'
import { isArriving } from '@/minigames/checkpoint-run/raceArrival'
import { useCheckpointStore } from '@/store/checkpointStore'
import { isPhoneLandscape } from '@/utils/layout'
import {
  CALL_FADE_SECONDS,
  POINTER_EDGE_INSET,
  POINTER_EDGE_INSET_HIGH,
  POINTER_SHORT_INSET_ABOVE,
  POINTER_SHORT_INSET_BELOW,
} from './constants'

const copy = CHECKPOINT_RUN_COPY.hud

interface RunHudParts {
  timer: HTMLElement
  ring: HTMLElement
  time: HTMLElement
  pointer: HTMLElement
  pips: HTMLElement
  call: HTMLElement
  split: HTMLElement
  surge: HTMLElement
}

function ringLabel({ course, readySeconds, passed }: Run) {
  if (readySeconds > 0) return copy.ready
  const total = COURSES[course].rings.length
  return passed < total ? copy.ring(passed + 1, total) : copy.finish
}

function showText(element: HTMLElement, text: string) {
  if (element.textContent !== text) element.textContent = text
}

function showStreak(pips: HTMLElement, { streak, surgeSeconds }: Run) {
  pips.classList.toggle('run-timer__pips--surging', surgeSeconds > 0)
  const { children } = pips
  for (let level = 0; level < children.length; level++) {
    children[level].classList.toggle('run-timer__pip--lit', level < streak)
  }
}

function showSurge(bar: HTMLElement, { surgeSeconds }: Run) {
  if (surgeSeconds > 0) bar.style.scale = `${surgeSeconds / SURGE_SECONDS} 1`
  else if (bar.style.scale) bar.style.scale = ''
}

function fadeCall(call: HTMLElement, seconds: number) {
  const isShown = seconds > 0
  if (call.hidden === isShown) call.hidden = !isShown
  if (isShown) call.style.opacity = String(Math.min(1, seconds / CALL_FADE_SECONDS))
  return isShown
}

function showCall(call: HTMLElement, { streak, callSeconds }: Run) {
  if (fadeCall(call, callSeconds)) {
    showText(call, copy.perfect(Math.round(SURGE_LEVELS[streak - 1] * 100)))
  }
}

function showSplit(split: HTMLElement, { splitGap, splitSeconds }: Run) {
  if (!fadeCall(split, splitSeconds)) return
  showText(split, copy.split(splitGap))
  split.classList.toggle('run-split--ahead', splitGap < 0)
}

function pointerInsetHigh(y: number) {
  if (!isPhoneLandscape()) return POINTER_EDGE_INSET_HIGH
  return y > 0 ? POINTER_SHORT_INSET_ABOVE : POINTER_SHORT_INSET_BELOW
}

function placePointer(pointer: HTMLElement) {
  const { x, y, isShown } = useCheckpointStore.getState().pointer
  const visibility = isShown ? 'visible' : 'hidden'
  if (pointer.style.visibility !== visibility) pointer.style.visibility = visibility
  if (!isShown) return
  const halfWidth = window.innerWidth / 2
  const halfHeight = window.innerHeight / 2
  const reach = Math.min(
    (halfWidth - POINTER_EDGE_INSET) / Math.max(Math.abs(x) * halfWidth, 1),
    (halfHeight - pointerInsetHigh(y)) / Math.max(Math.abs(y) * halfHeight, 1)
  )
  const left = halfWidth + x * halfWidth * reach
  const top = halfHeight - y * halfHeight * reach
  pointer.style.translate = `calc(${left}px - 50%) calc(${top}px - 50%)`
  pointer.style.rotate = `${Math.atan2(-y * halfHeight, x * halfWidth)}rad`
}

export function showRunReadout(run: Run, parts: RunHudParts) {
  parts.timer.classList.toggle('run-timer--arriving', isArriving(run))
  showText(parts.ring, ringLabel(run))
  showText(parts.time, CHECKPOINT_RUN_COPY.time(run.seconds))
  showStreak(parts.pips, run)
  showSurge(parts.surge, run)
  showCall(parts.call, run)
  showSplit(parts.split, run)
  placePointer(parts.pointer)
}
