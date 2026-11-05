import { useEffect, useState, type CSSProperties } from 'react'
import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import { isRaceClockRunning, useCheckpointStore } from '@/store/checkpointStore'
import { useSettingsStore } from '@/store/settingsStore'
import { GO_SECONDS } from '../constants'
import { isArriving } from '../raceArrival'
import './RaceCountdown.scss'

const GO_STYLE = { '--go-seconds': `${GO_SECONDS}s` } as CSSProperties

function readCall() {
  const { run } = useCheckpointStore.getState()
  if (!run || isArriving(run) || !isRaceClockRunning()) return null
  if (run.readySeconds > 0) return String(Math.ceil(run.readySeconds))
  return run.seconds < GO_SECONDS ? CHECKPOINT_RUN_COPY.hud.go : null
}

function CountdownCall() {
  const [call, setCall] = useState(readCall)
  const isMotionReduced = useSettingsStore((state) => state.isMotionReduced)

  useEffect(() => {
    let frame = 0
    const tick = () => {
      setCall(readCall())
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  if (call === null) return null
  const isGo = call === CHECKPOINT_RUN_COPY.hud.go
  const motion = isMotionReduced ? 'race-countdown__call--still' : ''
  const kind = isGo ? 'race-countdown__call--go' : ''
  return (
    <div className="race-countdown" role="status">
      <span
        key={call}
        className={`race-countdown__call ${motion} ${kind}`}
        style={isGo ? GO_STYLE : undefined}
      >
        {call}
      </span>
    </div>
  )
}

export default function RaceCountdown() {
  const isRunning = useCheckpointStore((state) => state.run !== null)
  return isRunning ? <CountdownCall /> : null
}
