import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { audio } from '@/audio/audioManager'
import {
  abandonRun,
  closePrompt,
  dismissResult,
  finishRun,
  isRaceClockRunning,
  landRunAtStart,
  noteCourseSeen,
  useCheckpointStore,
} from '@/store/checkpointStore'
import { useShipStore } from '@/store/shipStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { gapToBuoy, nextGateOf, stepRun, type Run } from './checkpointRun'
import { ARCH_LIFT, SEEN_REACH } from './constants'
import { COURSE_KEYS } from './courses'
import { noteSplit } from './ghost/ghostLap'
import { recordTrack } from './ghost/ghostTrack'
import { isArriving, stepArrival } from './raceArrival'
import { announceRingPass } from './ringFeedback'

interface Spot {
  x: number
  z: number
}

const _projected = new THREE.Vector3()

function noteNearbyCourses({ x, z }: Spot) {
  for (const course of COURSE_KEYS) {
    if (gapToBuoy(course, x, z) < SEEN_REACH) noteCourseSeen(course)
  }
}

function closeCardsIfInterrupted() {
  if (isRaceClockRunning()) return
  const { prompt, result } = useCheckpointStore.getState()
  if (prompt) closePrompt()
  if (result) dismissResult()
}

function pointAtNextGate(camera: THREE.Camera) {
  const { run, pointer } = useCheckpointStore.getState()
  if (!run || isArriving(run)) {
    pointer.isShown = false
    return
  }
  const gate = nextGateOf(run)
  _projected.set(gate.x, ARCH_LIFT, gate.z).project(camera)
  pointer.x = _projected.x
  pointer.y = _projected.y
  pointer.isShown = Math.abs(_projected.x) > 1 || Math.abs(_projected.y) > 1
}

function stepRace(run: Run, from: Spot, ship: Spot, dt: number) {
  const step = stepRun(run, from.x, from.z, ship.x, ship.z, dt)
  if (run.readySeconds === 0) recordTrack(run.track, run.seconds, ship.x, ship.z)
  if (step === 'go') audio.play('startWhistle')
  else if (step === 'strayed') abandonRun()
  else if (step) {
    noteSplit(run)
    const ring = step === 'finished' ? run.passed : run.passed - 1
    announceRingPass({ course: run.course, ring, kind: step })
    if (step === 'finished') finishRun()
  }
}

export function useCheckpointRun() {
  const last = useRef<Spot>({ x: 0, z: 0 })

  useFrame(({ camera }, delta) => {
    const ship = useShipStore.getState()
    const from = last.current
    const { run } = useCheckpointStore.getState()
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const isClockRunning = isRaceClockRunning()

    if (run && ship.placements !== run.placements) abandonRun()
    else if (run && isClockRunning) {
      if (!isArriving(run)) stepRace(run, from, ship, dt)
      else if (stepArrival(run, ship, dt) === 'landed') landRunAtStart(run)
    }

    closeCardsIfInterrupted()
    if (!run || !isArriving(run)) noteNearbyCourses(ship)
    pointAtNextGate(camera)
    if (!run || isClockRunning) {
      from.x = ship.x
      from.z = ship.z
    }
  })
}
