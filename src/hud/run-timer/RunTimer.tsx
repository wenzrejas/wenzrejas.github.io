import { useEffect, useLayoutEffect, useRef } from 'react'
import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import { SURGE_LEVELS } from '@/minigames/checkpoint-run/constants'
import { isArriving } from '@/minigames/checkpoint-run/raceArrival'
import { abandonRun, restartRun, useCheckpointStore } from '@/store/checkpointStore'
import { isPanelOpen } from '@/store/panelStore'
import { isWorldInView } from '@/store/viewStore'
import { loopAnimationFrames } from '@/utils/time'
import RunAction from './RunAction'
import { showRunReadout } from './runHudReadout'
import './RunTimer.scss'

const copy = CHECKPOINT_RUN_COPY.hud

function leaveRace() {
  const { run } = useCheckpointStore.getState()
  if (run && !isArriving(run)) abandonRun()
}

const isRestartKey = ({ key, repeat, ctrlKey, metaKey, altKey }: KeyboardEvent) =>
  key.toUpperCase() === copy.restartKey && !repeat && !ctrlKey && !metaKey && !altKey

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
    const timer = timerRef.current
    const ring = ringRef.current
    const time = timeRef.current
    const pointer = pointerRef.current
    const pips = pipsRef.current
    const call = callRef.current
    const split = splitRef.current
    const surge = surgeRef.current
    if (!timer || !ring || !time || !pointer || !pips || !call || !split || !surge) return

    const parts = { timer, ring, time, pointer, pips, call, split, surge }
    const showRun = () => {
      const { run } = useCheckpointStore.getState()
      if (run) showRunReadout(run, parts)
    }
    showRun()
    return loopAnimationFrames(showRun)
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
