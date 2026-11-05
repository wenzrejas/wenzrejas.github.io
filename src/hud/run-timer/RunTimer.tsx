import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import type { Run } from '@/minigames/checkpoint-run/checkpointRun'
import { SURGE_LEVELS, SURGE_SECONDS } from '@/minigames/checkpoint-run/constants'
import { COURSES } from '@/minigames/checkpoint-run/courses'
import { isArriving } from '@/minigames/checkpoint-run/raceArrival'
import KeyCap from '@/panels/shared/key-cap/KeyCap'
import { abandonRun, restartRun, useCheckpointStore } from '@/store/checkpointStore'
import { useIsTouchInput } from '@/store/inputStore'
import { isPanelOpen } from '@/store/panelStore'
import { isWorldInView } from '@/store/viewStore'
import { isPhoneLandscape, useCompactLayout } from '@/utils/layout'
import MenuIcon from '../menu/MenuIcon'
import {
  CALL_FADE_SECONDS,
  POINTER_EDGE_INSET,
  POINTER_EDGE_INSET_HIGH,
  POINTER_SHORT_INSET_ABOVE,
  POINTER_SHORT_INSET_BELOW,
} from './constants'
import './RunTimer.scss'

const copy = CHECKPOINT_RUN_COPY.hud

function leaveRace() {
  const { run } = useCheckpointStore.getState()
  if (run && !isArriving(run)) abandonRun()
}

const keepFocusOnWorld = (event: MouseEvent) => event.preventDefault()

const isRestartKey = ({ key, repeat, ctrlKey, metaKey, altKey }: KeyboardEvent) =>
  key.toUpperCase() === copy.restartKey && !repeat && !ctrlKey && !metaKey && !altKey

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

interface RunActionProps {
  icon: 'restart' | 'abandon'
  label: string
  keyLabel: string
  onClick: () => void
}

function RunAction({ icon, label, keyLabel, onClick }: RunActionProps) {
  const isTouch = useIsTouchInput()
  const isCompact = useCompactLayout()

  return (
    <button
      type="button"
      className="run-timer__action"
      aria-label={label}
      onMouseDown={keepFocusOnWorld}
      onClick={onClick}
    >
      {isCompact ? (
        <MenuIcon icon={icon} />
      ) : (
        <>
          {!isTouch && <KeyCap label={keyLabel} />}
          <span className="run-timer__action-label">{label}</span>
        </>
      )}
    </button>
  )
}

function RunHud() {
  const timerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const pointerRef = useRef<HTMLSpanElement>(null)
  const pipsRef = useRef<HTMLSpanElement>(null)
  const callRef = useRef<HTMLSpanElement>(null)
  const splitRef = useRef<HTMLSpanElement>(null)
  const surgeRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    let frame = 0
    const tick = () => {
      const { run } = useCheckpointStore.getState()
      const timer = timerRef.current
      const ring = ringRef.current
      const time = timeRef.current
      const pointer = pointerRef.current
      const pips = pipsRef.current
      const call = callRef.current
      const split = splitRef.current
      const surge = surgeRef.current
      if (run && timer && ring && time && pointer && pips && call && split && surge) {
        timer.classList.toggle('run-timer--arriving', isArriving(run))
        showText(ring, ringLabel(run))
        showText(time, CHECKPOINT_RUN_COPY.time(run.seconds))
        showStreak(pips, run)
        showSurge(surge, run)
        showCall(call, run)
        showSplit(split, run)
        placePointer(pointer)
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const answerKey = (event: KeyboardEvent) => {
      if (isPanelOpen() || !isWorldInView()) return
      if (event.key === 'Escape') leaveRace()
      else if (isRestartKey(event)) restartRun()
    }
    document.addEventListener('keydown', answerKey)
    return () => document.removeEventListener('keydown', answerKey)
  }, [])

  return (
    <>
      <div className="run-timer" ref={timerRef}>
        <div className="run-timer__readout">
          <span className="run-timer__ring" ref={ringRef} role="status" />
          <span className="run-timer__time" ref={timeRef} role="timer" />
          <span className="run-timer__pips" ref={pipsRef} aria-hidden="true">
            {SURGE_LEVELS.map((level) => (
              <span key={level} className="run-timer__pip" />
            ))}
          </span>
        </div>
        <RunAction
          icon="restart"
          label={copy.restart}
          keyLabel={copy.restartKey}
          onClick={restartRun}
        />
        <RunAction
          icon="abandon"
          label={copy.abandon}
          keyLabel={copy.abandonKey}
          onClick={leaveRace}
        />
        <span className="run-timer__surge" ref={surgeRef} aria-hidden="true" />
      </div>
      <div className="run-calls">
        <span className="run-call" ref={callRef} aria-live="polite" hidden />
        <span className="run-split" ref={splitRef} aria-live="polite" hidden />
      </div>
      <span className="run-pointer" ref={pointerRef} aria-hidden="true" />
    </>
  )
}

export default function RunTimer() {
  const isRunning = useCheckpointStore((state) => state.run !== null)
  return isRunning ? <RunHud /> : null
}
