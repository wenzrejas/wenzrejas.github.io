import { create } from 'zustand'
import { trackEvent } from '@/analytics/analytics'
import {
  isLapUsable,
  medalFor,
  startHeadingOf,
  startSpotOf,
  type BestLap,
  type Medal,
  type Run,
} from '@/minigames/checkpoint-run/checkpointRun'
import { READY_SECONDS } from '@/minigames/checkpoint-run/constants'
import { COURSES, COURSE_KEYS, type CourseKey } from '@/minigames/checkpoint-run/courses'
import { createArrival, isArriving, shipFadeOf } from '@/minigames/checkpoint-run/raceArrival'
import { isCinematicPlaying } from './cinematicStore'
import { isPanelOpen } from './panelStore'
import { isRevealPlaying } from './revealStore'
import { isMotionReduced } from './settingsStore'
import { placeShip, useShipStore } from './shipStore'
import { isWorldInView } from './viewStore'
import { rememberedRecord, rememberText } from './visitorMemory'

export interface RunResult {
  course: CourseKey
  seconds: number
  medal: Medal | null
  bestSeconds: number
  isNewBest: boolean
  perfects: number
}

interface RunRecord {
  bests: Partial<Record<CourseKey, number>>
  seenCourses: CourseKey[]
  laps: Partial<Record<CourseKey, BestLap>>
}

interface GatePointer {
  x: number
  y: number
  isShown: boolean
}

interface GhostSpot {
  x: number
  z: number
  isShown: boolean
}

interface CheckpointState extends RunRecord {
  run: Run | null
  result: RunResult | null
  prompt: CourseKey | null
  pointer: GatePointer
  ghostSpot: GhostSpot
}

const FRESH_RECORD: RunRecord = { bests: {}, seenCourses: [], laps: {} }

export const useCheckpointStore = create<CheckpointState>(() => ({
  ...rememberedRecord('checkpointRuns', FRESH_RECORD),
  run: null,
  result: null,
  prompt: null,
  pointer: { x: 0, y: 0, isShown: false },
  ghostSpot: { x: 0, z: 0, isShown: false },
}))

function rememberRecord() {
  const { bests, seenCourses, laps } = useCheckpointStore.getState()
  rememberText('checkpointRuns', JSON.stringify({ bests, seenCourses, laps }))
}

export function startRun(course: CourseKey) {
  trackEvent('regatta_started', { course })
  const lap = useCheckpointStore.getState().laps[course]
  useCheckpointStore.setState({
    run: {
      course,
      placements: useShipStore.getState().placements,
      arrival: createArrival(!isMotionReduced()),
      readySeconds: READY_SECONDS,
      passed: 0,
      seconds: 0,
      straySeconds: 0,
      streak: 0,
      surgeSeconds: 0,
      callSeconds: 0,
      perfects: 0,
      splits: [],
      track: [],
      rival: isLapUsable(course, lap) ? lap : null,
      splitGap: 0,
      splitSeconds: 0,
    },
    result: null,
    prompt: null,
  })
}

export function restartRun() {
  const { run } = useCheckpointStore.getState()
  if (run && !isArriving(run)) startRun(run.course)
}

export function landRunAtStart(run: Run) {
  const { x, z } = startSpotOf(run.course)
  placeShip(x, z, startHeadingOf(run.course))
  run.placements = useShipStore.getState().placements
}

export function finishRun() {
  const { run, bests, laps } = useCheckpointStore.getState()
  if (!run) return
  const previousBest = bests[run.course]
  const isNewBest = previousBest === undefined || run.seconds < previousBest
  const bestSeconds = isNewBest ? run.seconds : previousBest
  const medal = medalFor(run.course, run.seconds)
  trackEvent('regatta_finished', {
    course: run.course,
    medal: medal ?? 'none',
    seconds: Math.round(run.seconds),
  })
  useCheckpointStore.setState({
    run: null,
    bests: { ...bests, [run.course]: bestSeconds },
    laps: isNewBest ? { ...laps, [run.course]: { splits: run.splits, track: run.track } } : laps,
    result: {
      course: run.course,
      seconds: run.seconds,
      medal,
      bestSeconds,
      isNewBest,
      perfects: run.perfects,
    },
  })
  rememberRecord()
}

export function abandonRun() {
  const { run } = useCheckpointStore.getState()
  if (run) trackEvent('regatta_abandoned', { course: run.course })
  useCheckpointStore.setState({ run: null })
}

export const dismissResult = () => useCheckpointStore.setState({ result: null })

export const openPrompt = (course: CourseKey) => useCheckpointStore.setState({ prompt: course })

export const closePrompt = () => useCheckpointStore.setState({ prompt: null })

export function acceptPrompt() {
  const { prompt } = useCheckpointStore.getState()
  if (prompt) startRun(prompt)
}

export function noteCourseSeen(course: CourseKey) {
  const { seenCourses } = useCheckpointStore.getState()
  if (seenCourses.includes(course)) return
  useCheckpointStore.setState({ seenCourses: [...seenCourses, course] })
  rememberRecord()
}

export const isRaceClockRunning = () =>
  isWorldInView() && !isPanelOpen() && !isRevealPlaying() && !isCinematicPlaying()

export function isRaceHoldingShip() {
  const { run, result, prompt } = useCheckpointStore.getState()
  if (prompt !== null || result !== null) return true
  return run !== null && run.readySeconds > 0
}

export function raceShipFade() {
  const { run } = useCheckpointStore.getState()
  return run ? shipFadeOf(run) : 1
}

export function isRaceUnderway() {
  const { run, result } = useCheckpointStore.getState()
  return run !== null || result !== null
}

export const isRaceOnScreen = ({ run, result, prompt }: CheckpointState) =>
  run !== null || result !== null || prompt !== null

export function raceWindAngle() {
  const { run } = useCheckpointStore.getState()
  return run && COURSES[run.course].windAngle
}

export const goldCourses = ({ bests }: CheckpointState) =>
  COURSE_KEYS.filter((course) => medalFor(course, bests[course]) === 'gold')
